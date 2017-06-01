#!/usr/bin/env python3
import argparse
import string
import json
import re

from xml.dom import minidom
from xml.etree import ElementTree


def get_args():
    parser = argparse.ArgumentParser('Parse all tables that show percent disability rating for particular conditions')
    parser.add_argument('--input-files', dest='input_files', nargs='+')
    return parser.parse_args()


def pformat_element(element):
    parsed_xml = minidom.parseString(ElementTree.tostring(element)).toprettyxml()
    return '\n'.join([line for line in parsed_xml.splitlines() if line.strip()])


def pretty_print_element(element):
    print(pformat_element(element), end='')


def print_subject(element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        print("No SUBJECT.")
    else:
        pretty_print_element(subject_element)


def is_ratings_subject(element):
    subject_element = element.find('.//SUBJECT')
    if subject_element is None:
        return False
    else:
        return ('ratings' in subject_element.text.lower() and
                not subject_element.text.startswith('Combined'))


def parse_tables(filename):
    root = ElementTree.parse(filename)
    for element in root.findall(""".//GPOTABLE/.."""):
        if is_ratings_subject(element):
            yield element


def parse_files(filenames):
    for filename in filenames:
        for rating_table in parse_tables(filename):
            yield rating_table


def get_table_key_name(table_element):
    return table_element.find('.//SUBJECT').text.lower().replace('.', '').replace(',', '').replace(' ', '_').replace('—', '_')


def save_xml(table_element):
    with open(get_table_key_name(table_element) + '.xml', 'w') as of:
        of.write(pformat_element(table_element))


def save_json(table_element):
    with open(get_table_key_name(table_element) + '.json', 'w') as of:
        of.write(convert_table_to_json(table_element))


def is_integer_0_100(s):
    try:
        parsed_integer = int(s)
        return 0 <= parsed_integer <= 100
    except:
        return False


def is_category_row(row_element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 1 and entries[0].find('E') is None


def get_category(row_element):
    return row_element.find('ENT').text


def is_rating_row(row_element):
    entries = row_element.findall('ENT')
    row_length = len(entries)
    return row_length == 2 and is_integer_0_100(entries[1].text)


def get_rating(row_element):
    return row_element.findall('ENT')[0].text, int(row_element.findall('ENT')[1].text)


def convert_table_to_json(table_element):
    subject = table_element.find('.//SUBJECT').text

    document = {subject: {}}

    gpo_table = table_element.find('GPOTABLE')

    rows = gpo_table.findall('ROW')

    category_doc = None
    for row in rows:
        if is_category_row(row):
            category = get_category(row)
            category_doc = {}
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
