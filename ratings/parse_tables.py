#!/usr/bin/env python3
import argparse
import json
import logging
import os

from xml.etree import ElementTree

import copy
import transitions

import munging
import models
import util

logger = logging.getLogger(__file__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)



def get_args():
    parser = argparse.ArgumentParser('Parse all tables that show percent disability rating for particular conditions')
    parser.add_argument('--input-files', dest='input_files', nargs='+')
    parser.add_argument('--output-dir', dest='output_dir')
    parser.add_argument('--write-xml-tables', dest='write_xml_tables', action='store_true', default=False)
    parser.add_argument('-v', '--verbose', dest='verbose', action='store_true', default=False)
    return parser.parse_args()


def print_subject(element: ElementTree.Element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        print("No SUBJECT.")
    else:
        util.pretty_print_element(subject_element)


def is_ratings_subject(element: ElementTree.Element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        return False
    else:
        return ('ratings' in subject_element.text.lower() and
                not subject_element.text.startswith('Combined'))


def parse_tables(filename: str):
    root = ElementTree.parse(munging.repair_xml(filename))
    for element in root.findall(""".//GPOTABLE/.."""):
        if is_ratings_subject(element):
            yield element


def parse_files(filenames: list):
    for filename in filenames:
        logger.info('Processing filename: {}'.format(filename))
        for rating_table in parse_tables(filename):
            yield rating_table


def get_table_key_name(table_element: ElementTree.Element):
    return table_element.find('.//SUBJECT').text.lower().replace('.', '').replace(',', '').replace(' ', '_').replace(
        '—', '_')


def save_xml(table_element: ElementTree.Element, output_dir: str):
    with open(os.path.join(output_dir, get_table_key_name(table_element)) + '.xml', 'w') as of:
        of.write(util.pformat_element(table_element))


def is_category_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if util.inner_text(entry).strip() != '']
    row_length = len(entries)

    if row_length == 1:
        nwords = len(util.inner_text(entries[0]).split())
        if nwords <= 8:
            return True
        else:
            return False
    else:
        return False


def get_description(row_element: ElementTree.Element):
    return util.inner_text(row_element.find('ENT'))


def is_rating_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if util.inner_text(entry).strip()]
    row_length = len(entries)
    return row_length >= 2 and all([munging.is_integer_0_100(entry.text) for entry in entries[1:]])


def is_diagnostic_and_rating_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if util.inner_text(entry).strip()]
    row_length = len(entries)
    return row_length >= 2 and all([munging.is_integer_0_100(entry.text) for entry in entries[1:]]) and munging.describes_diagnostic_code(entries[0].text)


def get_rating(row_element: ElementTree.Element):
    return row_element.findall('ENT')[0].text, int(row_element.findall('ENT')[1].text)


def is_diagnostic_code_row(row_element: ElementTree.Element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and munging.describes_diagnostic_code(entries[0].text)


def is_note_row(row_element: ElementTree.Element):
    """
    Some rows are just an advisory note, for example:

    <ROW>
        <ENT I="13">
            <E T="02">Note 1:</E>
            Natural menopause, primary amenorrhea, and pregnancy and childbirth are not disabilities for rating purposes. Chronic residuals of medical or surgical complications of pregnancy may be disabilities for rating purposes.
        </ENT>
    </ROW>

    This will return true if this is the case.
    """
    entries = row_element.findall('ENT')
    row_length = len(entries)
    if row_length == 1:
        return entries[0].find('E') is not None and 'note' in entries[0].find('E').text.lower()
    else:
        return False


def is_see_other_row(row_element: ElementTree.Element):
    """
    Some rows refer to another section of the CFR.

    For example:

    <ROW>
        <ENT I="12">Inactive: See §§ 4.88b and 4.89.</ENT>
    </ROW>

    This will return true if this is the case.
    """
    entries = row_element.findall('ENT')
    row_length = len(entries)

    identifying_fragments = [
        'or evaluate as',
        'rate particular condition as',
        ' rate as',
        'rate the disability as',
        'rate as below'
    ]

    for entry in entries:
        text = util.inner_text(entry)
        if '&#167;' in text and 'see' in text.lower():
            return True
        elif any(x in text.lower() for x in identifying_fragments):
            return True
    return False


def is_general_rating_note_row(row_element: ElementTree.Element):
    """
    This type of row explains that the ratings to follow are applicable to
    the above listed diagnostic codes.

    For example:

    <ROW>
        <ENT I="11">General Rating Formula for Disease, Injury, or Adhesions of Female Reproductive Organs (diagnostic codes 7610 through 7615):</ENT>
    </ROW>
    """
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and util.inner_text(entries[0]).lower().strip().startswith('general rating formula')


def is_blank_row(row_element: ElementTree.Element):
    """
    Any row with contains only whitespace in its inner XML text.
    """
    return util.inner_text(row_element).replace('&#8201;', '').strip() == ''


class RatingTableStateMachine:
    """
    Defines a state machine for parsing the ratings table XML
    """
    states = ['category', 'diagnostic_code', 'rating', 'note', 'see_other_note']

    transitions = [
        {'trigger': 'process_category',
         'source': 'category',
         'dest': 'category',
         'before': 'add_child_category'},

        {'trigger': 'process_category',
         'source': ['rating', 'note', 'see_other_note'],
         'dest': 'category',
         'before': 'add_sibling_category'},

        {'trigger': 'process_category',
         'source': 'diagnostic_code',
         'dest': 'diagnostic_code',
         'before': 'add_diagnostic_code_info'},

        {'trigger': 'process_rating',
         'source': ['rating', 'diagnostic_code', 'note', 'see_other_note'],
         'dest': 'rating',
         'before': 'add_rating'},

        {'trigger': 'process_rating',
         'source': 'category',
         'dest': 'rating',
         'before': 'add_rating_under_previous_category_diagnostic'},

        {'trigger': 'process_combined_diagnostic_rating',
         'source': ['category', 'rating', 'see_other_note', 'note', 'diagnostic_code'],
         'dest': 'rating',
         'before': 'add_combined_diagnostic_rating'},

        {'trigger': 'process_diagnostic_code',
         'source': ['note', 'rating', 'see_other_note', 'category'],
         'dest': 'diagnostic_code',
         'before': 'add_first_diagnostic_code'},

        {'trigger': 'process_diagnostic_code',
         'source': 'diagnostic_code',
         'dest': 'diagnostic_code',
         'before': 'add_diagnostic_code'},

        {'trigger': 'process_note',
         'source': ['category', 'rating', 'note', 'diagnostic_code', 'see_other_note'],
         'dest': 'note',
         'before': 'add_note'},

        {'trigger': 'process_see_other_note',
         'source': ['rating', 'diagnostic_code', 'see_other_note', 'category', 'note'],
         'dest': 'see_other_note',
         'before': 'add_see_other_note'},
    ]

    def __init__(self, name: str, initial: models.RatingCategory):
        self.name = name
        self.last_category = initial
        self.current_category = initial
        self.last_row = None
        self.current_row = None
        self.current_diagnostic_code_set = None

        # Initialize the state machine
        self.machine = transitions.Machine(model=self,
                                           states=RatingTableStateMachine.states,
                                           initial='category',
                                           transitions=self.transitions)

    def add_child_category(self, element):
        desc = get_description(element)
        subcategory = models.RatingCategory(desc, parent=self.current_category, header=self.current_category.header)
        self.current_category.add_subcategory(subcategory)
        self.last_category = self.current_category
        self.current_category = subcategory

    def add_sibling_category(self, element):
        desc = get_description(element)
        category = models.RatingCategory(desc, parent=self.current_category.parent, header=self.current_category.header)
        self.current_category.parent.add_subcategory(category)
        self.last_category = self.current_category
        self.current_category = category

    def add_first_diagnostic_code(self, element):
        logger.debug('Add First Diagnostic Code:\n' + util.pformat_element(element))
        self.current_diagnostic_code_set = models.DiagnosticCodeSet(header=self.current_category.header)
        self.current_category.add_diagnostic_code_set(self.current_diagnostic_code_set)
        self.add_diagnostic_code(element)

    def add_diagnostic_code(self, element):
        logger.debug('Add Subsequent Diagnostic Code:\n' + util.pformat_element(element))
        self.current_diagnostic_code_set.add_diagnostic_code(models.DiagnosticCode.from_element(element))

    def add_rating(self, element):
        self.current_diagnostic_code_set.add_rating(models.Rating.from_element(element))

    def add_note(self, element):
        self.current_category.add_note(models.RatingNote.from_element(element))

    def add_see_other_note(self, element):
        self.current_category.add_see_other_note(models.SeeOtherRatingNote.from_element(element))

    def add_diagnostic_code_info(self, element):
        self.current_diagnostic_code_set.add_note(
            models.RatingNote.from_element(element))

    def get_closest_category_with_diagnostic_code(self, next_closest: models.RatingCategory):
        if next_closest.has_diagnostic_codes():
            return next_closest

        for category in next_closest.parent.get_older_siblings(next_closest):
            if category.has_diagnostic_codes():
                return category

        if next_closest.is_root():
            raise ValueError("No relative with diagnostic code found.")

        return self.get_closest_category_with_diagnostic_code(next_closest.parent)

    def add_rating_under_previous_category_diagnostic(self, element):
        last_diagnostic_code_set = copy.deepcopy(
            self.get_closest_category_with_diagnostic_code(self.current_category).diagnostic_code_sets[-1])
        last_diagnostic_code_set.ratings = []
        last_diagnostic_code_set.notes = []
        self.current_diagnostic_code_set = last_diagnostic_code_set
        self.current_category.add_diagnostic_code_set(self.current_diagnostic_code_set)
        self.current_diagnostic_code_set.add_rating(models.Rating.from_element(element))

    def add_combined_diagnostic_rating(self, element):
        self.current_diagnostic_code_set = models.DiagnosticCodeSet(header=self.current_category.header)
        self.current_category.add_diagnostic_code_set(self.current_diagnostic_code_set)
        self.add_diagnostic_code(element)
        self.add_rating(element)

    def process_row(self, row: ElementTree.Element):
        self.last_row = self.current_row
        self.current_row = row

        try:
            self.process_row_unsafe(row)
        except Exception as e:
            if self.last_row is not None:
                logger.info(util.pformat_element(self.last_row))
                logger.info(util.inner_text(self.last_row))
            else:
                logger.info("---FIRST ROW---")
            logger.info(util.pformat_element(self.current_row))
            logger.info(util.inner_text(self.current_row))
            raise e

    def process_row_unsafe(self, row: ElementTree.Element):
        if is_blank_row(row):
            logger.debug("Ignoring blank row:\n" + util.pformat_element(row))
        elif is_see_other_row(row):
            logger.debug("See Other:\n" + util.pformat_element(row))
            self.process_see_other_note(row)
        elif is_diagnostic_code_row(row):
            logger.debug("Diagnostic Code:\n" + util.pformat_element(row))
            self.process_diagnostic_code(row)
        elif is_diagnostic_and_rating_row(row):
            logger.debug("Diagnostic + Rating:\n" + util.pformat_element(row))
            self.process_combined_diagnostic_rating(row)
        elif is_rating_row(row):
            logger.debug("Rating:\n" + util.pformat_element(row))
            self.process_rating(row)
        elif is_category_row(row):
            logger.debug("Category:\n" + util.pformat_element(row))
            self.process_category(row)
        elif is_general_rating_note_row(row):
            logger.debug("General Rating:\n" + util.pformat_element(row))
            pass
        else:
            logger.debug("Note:\n" + util.pformat_element(row))
            self.process_note(row)
        #else:
        #    raise ValueError('Unexpected row: {}'.format(util.pformat_element(row)))


def maybe_deduce_diagnosis_from_subject(category: models.RatingCategory):
    """
    Some tables have an implied diagnosis for all ratings within, since they are for one specific
    thing, i.e. tuberculosis.

    This will set the diagnosis appropriately.
    """
    if 'tuberculosis' in category.description.lower():
        code_set = models.DiagnosticCodeSet(['Rating'])
        category.add_diagnostic_code_set(code_set)
        code_set.add_diagnostic_code(models.DiagnosticCode(6701, 'tuberculosis'))  # TODO(Not sure what this is actually)
    elif 'genitourinary' in category.description.lower():
        code_set = models.DiagnosticCodeSet(['Rating'])
        category.add_diagnostic_code_set(code_set)
        code_set.add_diagnostic_code(models.DiagnosticCode(9999, 'genitourinary'))  # TODO(Not sure what this is actually)
    elif 'mental disorders' in category.description.lower():
        code_set = models.DiagnosticCodeSet(['Rating'])
        category.add_diagnostic_code_set(code_set)
        code_set.add_diagnostic_code(models.DiagnosticCode(9999, 'mental disorders'))  # TODO(Not sure what this is actually)


def get_rating_table_header(table_element: ElementTree.Element):
    header = table_element.find('BOXHD')

    header_elements = header.findall('CHED')

    return [x.text for x in header_elements[1:]]


def convert_table_to_json(table_element: ElementTree.Element):
    subject = table_element.find('.//SUBJECT').text

    gpo_table = table_element.find('GPOTABLE')

    header = get_rating_table_header(gpo_table)
    rows = gpo_table.findall('ROW')

    root = models.RatingCategory(subject, header=header)
    maybe_deduce_diagnosis_from_subject(root)
    root.parent = root

    machine = RatingTableStateMachine(subject, root)

    for row in rows:
        machine.process_row(row)

    return json.dumps(root, indent=True, cls=models.RatingTableEncoder)


def save_json(table_element: ElementTree.Element, output_dir: str):
    logger.info('Converting {} table to json'.format(get_table_key_name(table_element)))

    table_as_json = convert_table_to_json(table_element)
    with open(os.path.join(output_dir, get_table_key_name(table_element)) + '.json', 'w') as of:
        of.write(table_as_json)


def main():
    args = get_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)
        transitions.logger.setLevel(logging.INFO)
        transitions.logger.addHandler(ch)
    else:
        logger.setLevel(logging.INFO)

    successful = 0
    failed = 0
    for table_element in parse_files(args.input_files):
        if args.write_xml_tables:
            save_xml(table_element, args.output_dir)
        save_json(table_element, args.output_dir)
        successful += 1

    logger.info("{:d}/{:d} tables parsed".format(successful, successful + failed))


if __name__ == '__main__':
    main()
