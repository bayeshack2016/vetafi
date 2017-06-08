import xml

from xml.dom import minidom
from xml.etree import ElementTree


def pformat_element(element: ElementTree.Element):
    parsed_xml = minidom.parseString(ElementTree.tostring(element)).toprettyxml()
    return '\n'.join([line for line in parsed_xml.splitlines() if line.strip()])


def pretty_print_element(element: ElementTree.Element):
    print(pformat_element(element) + '\n', end='')


def inner_xml(element: ElementTree.Element) -> str:
    """
    Get all contents of element as string.
    """

    return "".join(([element.text] if element.text is not None else []) + [e.text for e in element if e.text is not None])