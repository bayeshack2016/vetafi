from xml.dom import minidom
from xml.etree import ElementTree


def pformat_element(element: ElementTree.Element):
    parsed_xml = minidom.parseString(ElementTree.tostring(element)).toprettyxml()
    return '\n'.join([line for line in parsed_xml.splitlines() if line.strip()])


def pretty_print_element(element: ElementTree.Element):
    print(pformat_element(element) + '\n', end='')
