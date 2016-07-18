import pprint
import sys

from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdftypes import resolve1


def load_form(filename):
    """Load pdf form contents into a nested list of name/value tuples"""
    with open(filename, 'rb') as file:
        parser = PDFParser(file)
        doc = PDFDocument(parser)
        for f in resolve1(doc.catalog['AcroForm'])['Fields']:
            for field_name in load_fields(resolve1(f)):
                yield field_name


def load_fields(field):
    """Recursively load form fields"""
    form = field.get('Kids', None)
    if form:
        for f in form:
            for field_name in load_fields(resolve1(f)):
                yield field_name
    else:
        try:
            yield field.get('T').decode('utf-16')
        except:
            yield field.get('T')

        #yield field
        # Some field types, like signatures, need extra resolving
        #return (field.get('T').decode('utf-16'), resolve1(field.get('V')))


if __name__ == '__main__':
    pprint.pprint([f for f in load_form(sys.argv[1])])
