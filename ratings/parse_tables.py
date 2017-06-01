#!/usr/bin/env python3
import argparse

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


def save_table(table_element):
    subject = table_element.find('.//SUBJECT').text.lower().replace(' ', '_')

    with open(subject + '.xml', 'w') as of:
        of.write(pformat_element(table_element))


def main():
    args = get_args()
    for table_element in parse_files(args.input_files):
        save_table(table_element)


if __name__ == '__main__':
    main()
