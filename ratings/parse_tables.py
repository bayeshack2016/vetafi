#!/usr/bin/env python3
import argparse
import json
import transitions

from json import JSONEncoder
from xml.dom import minidom
from xml.etree import ElementTree


class RatingTableStateMachine:
    """
    Defines a state machine for parsing the ratings table XML
    """
    states = ['category', 'rating', 'reference']

    transitions = [
        {'trigger': 'add_category', 'source': 'category', 'dest': 'category'},
        {'trigger': 'add_category', 'source': 'reference', 'dest': 'category'},
        {'trigger': 'add_category', 'source': 'rating', 'dest': 'category'},
        {'trigger': 'add_reference', 'source': 'rating', 'dest': 'reference'},
        {'trigger': 'add_reference', 'source': 'category', 'dest': 'reference'},
        {'trigger': 'add_rating', 'source': 'category', 'dest': 'rating'},
    ]

    def __init__(self, name):
        self.name = name

        # Initialize the state machine
        self.machine = transitions.Machine(model=self,
                                           states=RatingTableStateMachine.states,
                                           initial='category',
                                           transitions=self.transitions)

    def parse_row(self, row: ElementTree.Element):
        pass




def get_args():
    parser = argparse.ArgumentParser('Parse all tables that show percent disability rating for particular conditions')
    parser.add_argument('--input-files', dest='input_files', nargs='+')
    return parser.parse_args()


def pformat_element(element: ElementTree.Element):
    parsed_xml = minidom.parseString(ElementTree.tostring(element)).toprettyxml()
    return '\n'.join([line for line in parsed_xml.splitlines() if line.strip()])


def pretty_print_element(element: ElementTree.Element):
    print(pformat_element(element), end='')


def print_subject(element: ElementTree.Element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        print("No SUBJECT.")
    else:
        pretty_print_element(subject_element)


def is_ratings_subject(element: ElementTree.Element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        return False
    else:
        return ('ratings' in subject_element.text.lower() and
                not subject_element.text.startswith('Combined'))


def parse_tables(filename: str):
    root = ElementTree.parse(filename)
    for element in root.findall(""".//GPOTABLE/.."""):
        if is_ratings_subject(element):
            yield element


def parse_files(filenames: list):
    for filename in filenames:
        for rating_table in parse_tables(filename):
            yield rating_table


def get_table_key_name(table_element: ElementTree.Element):
    return table_element.find('.//SUBJECT').text.lower().replace('.', '').replace(',', '').replace(' ', '_').replace(
        '—', '_')


def save_xml(table_element: ElementTree.Element):
    with open(get_table_key_name(table_element) + '.xml', 'w') as of:
        of.write(pformat_element(table_element))


def save_json(table_element: ElementTree.Element):
    with open(get_table_key_name(table_element) + '.json', 'w') as of:
        of.write(convert_table_to_json(table_element))


def is_integer_0_100(s: str):
    try:
        parsed_integer = int(s)
        return 0 <= parsed_integer <= 100
    except:
        return False


def is_category_row(row_element: ElementTree.Element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and entries[0].find('E') is None


def get_description(row_element: ElementTree.Element):
    return row_element.find('ENT').text


def is_rating_row(row_element: ElementTree.Element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 2 and is_integer_0_100(entries[1].text)


def get_rating(row_element: ElementTree.Element):
    return row_element.findall('ENT')[0].text, int(row_element.findall('ENT')[1].text)


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
    return row_length == 1 and entries[0].text.lower().contains('or evaluate as')


class RatingTableEncoder(JSONEncoder):
    def default(self, o):
        if (isinstance(o, Rating) or
                isinstance(o, RatingCategory) or
                isinstance(o, RatingReference)):
            return o.as_dict()
        else:
            return super().default(o)


class Rating:
    def __init__(self, description: str, rating: int):
        self.rating = rating
        self.description = description

    def as_dict(self):
        return {'rating': self.rating,
                'description': self.rating}


class RatingReference:
    def __init__(self, description: str):
        self.description = description

    def as_dict(self):
        return {'reference': self.description}


class RatingCategory:
    def __init__(self, description: str, parent: 'RatingCategory' = None):
        self.description = description
        self.children = []
        self.subcategories = []
        self.parent = parent

    def add_rating(self, rating: Rating):
        self.children.append(rating)

    def add_subcategory(self, subcategory: 'RatingCategory'):
        self.children.append(subcategory)

    def as_dict(self):
        return {'category': self.description,
                'subcategories': [x.as_dict() for x in self.subcategories],
                'ratings': [x.as_dict() for x in self.children]}


def convert_table_to_json(table_element: ElementTree.Element):
    subject = table_element.find('.//SUBJECT').text

    gpo_table = table_element.find('GPOTABLE')

    rows = gpo_table.findall('ROW')

    category = RatingCategory(subject)
    for row in rows:
        if is_category_row(row):
            new_category = RatingCategory(get_description(row), parent=category)

            document[subject][category] = category_doc
        elif is_rating_row(row):
            subcategory, rating = get_rating(row)

            if category_doc is None:
                document[subject][subcategory] = rating
            else:
                category_doc[subcategory] = rating

    return json.dumps(document, indent=True)


def main():
    args = get_args()
    for table_element in parse_files(args.input_files):
        save_xml(table_element)
        save_json(table_element)


if __name__ == '__main__':
    main()
