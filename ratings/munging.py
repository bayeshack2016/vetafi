import re

from io import StringIO
from xml.etree import ElementTree


def repair_xml(filename: str) -> StringIO:
    """
    These random <SU> elements appear in the CFR in a bunch of places.
    
    They seem to contain no information and break the structure of the XML,
    so we are forced to cut them off at the source.
    """
    acceptable_lines = []
    with open(filename) as f:
        for line in f:
            if '<SU>' in line:
                acceptable_lines.append(
                    line.replace('<SU>1</SU>', '').replace('<SU>2</SU>', '').replace('<SU>3</SU>', ''))
            else:
                acceptable_lines.append(line)
    return StringIO('\n'.join(acceptable_lines))


def is_integer_0_100(s: str) -> bool:
    """
    Return true if the string represents number 0-100, false otherwise.
    """
    try:
        parsed_integer = int(s)
        return 0 <= parsed_integer <= 100
    except:
        return False


def describes_diagnostic_code(text: str) -> bool:
    """
    Return true if the text describes a diagnostic code. 
    """
    if re.match('^[0-9]{4}.*', text.strip()):
        return True
    else:
        return False


def extract_entry_text(row: ElementTree.Element):
    """
    Get combined text from ENT tag and its child E tags.
    """
    return ' '.join([x.text for x in row.findall('E')]) + row.text if row.text is not None else ''

