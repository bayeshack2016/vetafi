#!/usr/bin/env python3
import argparse
import json
import logging

from xml.etree import ElementTree

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

transitions.logger.setLevel(logging.INFO)
transitions.logger.addHandler(ch)

def get_args():
    parser = argparse.ArgumentParser('Parse all tables that show percent disability rating for particular conditions')
    parser.add_argument('--input-files', dest='input_files', nargs='+')
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


def save_xml(table_element: ElementTree.Element):
    with open(get_table_key_name(table_element) + '.xml', 'w') as of:
        of.write(util.pformat_element(table_element))


def is_category_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if munging.extract_entry_text(entry).strip()]
    row_length = len(entries)
    return row_length == 1


def get_description(row_element: ElementTree.Element):
    return row_element.find('ENT').text


def is_rating_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if munging.extract_entry_text(entry).strip()]
    row_length = len(entries)
    return row_length >= 2 and all([munging.is_integer_0_100(entry.text) for entry in entries[1:]])


def is_diagnostic_and_rating_row(row_element: ElementTree.Element):
    entries = [entry for entry in row_element.findall('ENT') if munging.extract_entry_text(entry).strip()]
    row_length = len(entries)
    return row_length >= 2 and all([munging.is_integer_0_100(entry.text) for entry in entries[1:]]) and munging.describes_diagnostic_code(entries[0].text)


def get_rating(row_element: ElementTree.Element):
    return row_element.findall('ENT')[0].text, int(row_element.findall('ENT')[1].text)


def is_diagnostic_code_row(row_element: ElementTree.Element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and munging.describes_diagnostic_code(entries[0].text)


def is_reference_row(row_element: ElementTree.Element):
    """
    Some rows reference a different rating table, saying something like:
    
    "Or evaluate as DC 7800, scars, disfiguring, head, face, or neck."
    
    This will return true if this is the case.
    
    :param row_element: The row ElementTree object
    :return: 
    """
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and 'or evaluate as' in entries[0].text.lower()


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

    for entry in entries:
        text = munging.extract_entry_text(entry)
        if '§' in text and 'see' in text.lower():
            return True
        elif (' rate as' in text.lower() or 'rate the disability as' in text.lower()) and not 'rate as below' in text.lower():
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
    return row_length == 1 and munging.extract_entry_text(entries[0]).lower().strip().startswith('general rating formula')


class RatingTableStateMachine:
    """
    Defines a state machine for parsing the ratings table XML
    """
    states = ['category', 'diagnostic_code', 'rating', 'reference', 'note', 'see_other_note']

    transitions = [
        {'trigger': 'process_category',
         'source': 'category',
         'dest': 'category',
         'before': 'add_child_category'},

        {'trigger': 'process_category',
         'source': ['reference', 'rating', 'note'],
         'dest': 'category',
         'before': 'add_sibling_category'},

        {'trigger': 'process_category',
         'source': 'diagnostic_code',
         'dest': 'diagnostic_code',
         'before': 'add_diagnostic_code_info'},

        {'trigger': 'process_reference',
         'source': ['rating', 'category'],
         'dest': 'reference',
         'before': 'add_reference'},

        {'trigger': 'process_rating',
         'source': ['rating', 'diagnostic_code', 'note'],
         'dest': 'rating',
         'before': 'add_rating'},

        {'trigger': 'process_rating',
         'source': 'category',
         'dest': 'rating',
         'before': 'add_rating_under_previous_category_diagnostic'},

        {'trigger': 'process_combined_diagnostic_rating',
         'source': ['category', 'rating', 'see_other_note', 'diagnostic_code'],
         'dest': 'rating',
         'before': 'add_combined_diagnostic_rating'},

        {'trigger': 'process_diagnostic_code',
         'source': ['note', 'diagnostic_code', 'see_other_note', 'category'],
         'dest': 'diagnostic_code',
         'before': 'add_first_diagnostic_code'},

        {'trigger': 'process_diagnostic_code',
         'source': 'diagnostic_code',
         'dest': 'diagnostic_code',
         'before': 'add_diagnostic_code'},
        
        {'trigger': 'process_diagnostic_code',
         'source': 'rating',
         'dest': 'diagnostic_code',
         'before': 'add_first_diagnostic_code'},

        {'trigger': 'process_note',
         'source': ['category', 'rating', 'note'],
         'dest': 'note',
         'before': 'add_note'},

        {'trigger': 'process_see_other_note',
         'source': ['rating', 'diagnostic_code', 'see_other_note'],
         'dest': 'see_other_note',
         'before': 'add_see_other_note'},
    ]

    def __init__(self, name: str, initial: models.RatingCategory):
        self.name = name
        self.last_category = None
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
        subcategory = models.RatingCategory(desc, parent=self.current_category)
        self.current_category.add_subcategory(subcategory)
        self.last_category = self.current_category
        self.current_category = subcategory

    def add_sibling_category(self, element):
        desc = get_description(element)
        category = models.RatingCategory(desc, parent=self.current_category.parent)
        self.current_category.parent.add_subcategory(category)
        self.last_category = self.current_category
        self.current_category = category

    def add_reference(self, element):
        self.current_category.add_reference(models.RatingReference.from_element(element))

    def add_first_diagnostic_code(self, element):
        self.current_diagnostic_code_set = models.DiagnosticCodeSet()
        self.current_category.add_diagnostic_code_set(self.current_diagnostic_code_set)
        self.add_diagnostic_code(element)

    def add_diagnostic_code(self, element):
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

    def add_rating_under_previous_category_diagnostic(self, element):
        last_diagnostic_code_set = self.last_category.diagnostic_code_sets[-1]
        last_diagnostic_code_set.ratings = []
        last_diagnostic_code_set.notes = []
        self.current_diagnostic_code_set = last_diagnostic_code_set
        self.current_category.add_diagnostic_code_set(self.current_diagnostic_code_set)
        self.current_diagnostic_code_set.add_rating(models.Rating.from_element(element))

    def add_combined_diagnostic_rating(self, element):
        self.current_diagnostic_code_set = models.DiagnosticCodeSet()
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
            else:
                logger.info("---FIRST ROW---")
            logger.info(util.pformat_element(self.current_row))
            raise e

    def process_row_unsafe(self, row: ElementTree.Element):
        if is_see_other_row(row):
            self.process_see_other_note(row)
        elif is_diagnostic_code_row(row):
            self.process_diagnostic_code(row)
        elif is_reference_row(row):
            self.process_reference(row)
        elif is_diagnostic_and_rating_row(row):
            self.process_combined_diagnostic_rating(row)
        elif is_rating_row(row):
            self.process_rating(row)
        elif is_note_row(row):
            self.process_note(row)
        elif is_general_rating_note_row(row):
            pass
        elif is_category_row(row):
            self.process_category(row)
        else:
            raise ValueError('Unexpected row: {}'.format(util.pformat_element(row)))


def convert_table_to_json(table_element: ElementTree.Element):
    subject = table_element.find('.//SUBJECT').text

    gpo_table = table_element.find('GPOTABLE')

    rows = gpo_table.findall('ROW')

    root = models.RatingCategory(subject)
    root.parent = root
    machine = RatingTableStateMachine(subject, root)

    for row in rows:
        machine.process_row(row)

    return json.dumps(root, indent=True, cls=models.RatingTableEncoder)


def save_json(table_element: ElementTree.Element):
    logger.info('Converting {} table to json'.format(get_table_key_name(table_element)))

    try:
        table_as_json = convert_table_to_json(table_element)
        with open(get_table_key_name(table_element) + '.json', 'w') as of:
            of.write(table_as_json)
    except:
        logger.exception('Failed to parse table {}'.format(get_table_key_name(table_element)))


def main():
    args = get_args()
    for table_element in parse_files(args.input_files):
        save_xml(table_element)
        save_json(table_element)


if __name__ == '__main__':
    main()
