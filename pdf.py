from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdftypes import resolve1


def load_form(filename):
    """Load pdf form contents into a nested list of name/value tuples"""
    with open(filename, 'rb') as file:
        parser = PDFParser(file)
        doc = PDFDocument(parser)
        return [load_fields(resolve1(f)) for f in
                   resolve1(doc.catalog['AcroForm'])['Fields']]

def load_fields(field):
    """Recursively load form fields"""
    form = field.get('Kids', None)
    if form:
        return [load_fields(resolve1(f)) for f in form]
    else:
        # Some field types, like signatures, need extra resolving
        return (field.get('T').decode('utf-16'), field, resolve1(field.get('V')))
