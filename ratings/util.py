import xml

from xml.dom import minidom
from xml.etree import ElementTree


def pformat_element(element: ElementTree.Element):
    parsed_xml = minidom.parseString(ElementTree.tostring(element)).toprettyxml()
    return '\n'.join([line for line in parsed_xml.splitlines() if line.strip()])


def pretty_print_element(element: ElementTree.Element):
    print(pformat_element(element) + '\n', end='')


def strip_tags(s) -> str:
    in_tag = False

    chars = []

    for c in s:
        if c == '<':
            in_tag = True
        elif c == '>':
            in_tag = False
        else:
            if not in_tag:
                chars.append(c)

    return ''.join(chars)


def inner_text(element: ElementTree.Element) -> str:
    """
    Get all contents of element as string.
    """
    return strip_tags(ElementTree.tostring(element, encoding='utf-8').decode('utf-8'))
