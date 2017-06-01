#!/usr/bin/env python3
import argparse


def get_args():
    parser = argparse.ArgumentParser('Extract all tables that show percent disability rating for particular conditions')
    parser.add_argument('--input-files', dest='input_files', nargs='+')
    return parser.parse_args()


def has_rating_info(table):
    return any(['CHED' in row and 'Rating' in row for row in table])


def get_tables(input_file):
    tables = []
    with open(input_file) as f:
        in_table = False
        table = []
        for line in f:
            if 'GPOTABLE' in line:
                if in_table:
                    tables.append(table)
                    table = []
                in_table = not in_table
            if in_table:
                table.append(line)
    return [t for t in tables if has_rating_info(t)]


def get_title(table):
    titles = [x for x in table if 'TTITLE' in x]
    if titles:
        return titles[0]
    else:

        return None

def get_subject(table):
    titles = [x for x in table if 'SUBJECT' in x]
    if titles:
        return titles[0]
    else:
        return None

def main():
    args = get_args()
    tables = []
    for input_file in args.input_files:
        tables.extend(get_tables(input_file))
    for idx, table in enumerate(tables):
        with open(str(idx) + '.xml', 'w') as of:
            of.write(''.join(table))


if __name__ == '__main__':
    main()
