import json
import re

import util

from json import JSONEncoder


class RatingTableEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, RatingTableObject):
            return o.as_dict()
        else:
            return super().default(o)


class RatingTableObject:
    def as_dict(self):
        raise NotImplementedError


class Rating(RatingTableObject):
    def __init__(self, description: str, ratings: list):
        self.ratings = ratings
        self.description = description

    @classmethod
    def from_element(cls, element) -> 'Rating':
        entries = [entry for entry in element.findall('ENT') if util.inner_text(entry).strip()]
        return Rating(entries[0].text, [int(entry.text) for entry in entries[1:]])

    def as_dict(self):
        return {'ratings': self.ratings,
                'description': self.description}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())


class RatingNote(RatingTableObject):
    def __init__(self, description: str):
        self.description = description

    @classmethod
    def from_element(cls, element) -> 'RatingNote':
        return RatingNote(util.inner_text(element))

    def as_dict(self):
        return {'note': self.description}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())


class DiagnosticCode(RatingTableObject):
    def __init__(self, code: int, description: str):
        self.code = code
        self.description = description

    @classmethod
    def from_element(cls, element) -> 'DiagnosticCode':
        entries = [entry for entry in element.findall('ENT') if util.inner_text(entry).strip()]
        code = re.findall('[0-9]{4}', entries[0].text)[0]
        description = re.sub('[0-9]{4}', '', util.inner_text(element))
        return DiagnosticCode(int(code), description)

    def as_dict(self):
        return {'code': self.code,
                'description': self.description}


class DiagnosticCodeSet(RatingTableObject):
    def __init__(self):
        self.codes = []
        self.ratings = []
        self.notes = []

    def add_diagnostic_code(self, code: DiagnosticCode):
        self.codes.append(code)

    def add_rating(self, rating: Rating):
        self.ratings.append(rating)

    def add_note(self, note: RatingNote):
        self.notes.append(note)

    def as_dict(self):
        return {'ratings': [rating.as_dict() for rating in self.ratings],
                'codes': [code.as_dict() for code in self.codes],
                'notes': [note.as_dict() for note in self.notes]}


class RatingReference(RatingTableObject):
    def __init__(self, description: str):
        self.description = description

    @classmethod
    def from_element(cls, element) -> 'RatingReference':
        return RatingReference(util.inner_text(element))

    def as_dict(self):
        return {'reference': self.description}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())


class SeeOtherRatingNote(RatingTableObject):
    def __init__(self, description: str):
        self.description = description

    @classmethod
    def from_element(cls, element) -> 'SeeOtherRatingNote':
        return SeeOtherRatingNote(util.inner_text(element))

    def as_dict(self):
        return {'see_other_note': self.description}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())


class RatingCategory(RatingTableObject):
    def __init__(self, description: str, parent: 'RatingCategory' = None):
        self.description = description
        self.diagnostic_code_sets = []
        self.subcategories = []
        self.references = []
        self.diagnostic_codes = []
        self.see_other_notes = []
        self.notes = []
        self.parent = parent

    def add_subcategory(self, subcategory: 'RatingCategory'):
        self.subcategories.append(subcategory)

    def add_reference(self, reference):
        self.references.append(reference)

    def add_note(self, note):
        self.notes.append(note)

    def add_diagnostic_code_set(self, diagnostic_code_set: DiagnosticCodeSet):
        self.diagnostic_code_sets.append(diagnostic_code_set)

    def add_see_other_note(self, see_other_note):
        self.see_other_notes.append(see_other_note)

    def has_diagnostic_codes(self):
        return len(self.diagnostic_code_sets) > 0

    def is_root(self):
        return id(self.parent) == id(self)

    def get_older_siblings(self, older_than):
        for category in self.subcategories:
            if id(category) == id(older_than):
                break
            yield category

    def as_dict(self):
        return {'category': self.description,
                'subcategories': [x.as_dict() for x in self.subcategories],
                'diagnostic_code_sets': [x.as_dict() for x in self.diagnostic_code_sets],
                'references': [x.as_dict() for x in self.references],
                'notes': [x.as_dict() for x in self.notes],
                'see_other_notes': [x.as_dict() for x in self.see_other_notes],
                }

    def __str__(self) -> str:
        return json.dumps(self.as_dict())
