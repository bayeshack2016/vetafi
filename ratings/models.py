import json
import re

import util
import munging

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
        return Rating(entries[0].text,
                      [int(entry.text) for entry in entries[1:]])

    def as_dict(self):
        return {'ratings': self.ratings,
                'description': munging.strip_whitespace(self.description)}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())


class SingleRating(RatingTableObject):
    def __init__(self, description: str, rating: int):
        self.rating = rating
        self.description = description

    def as_dict(self):
        return {'rating': self.rating,
                'description': munging.strip_whitespace(self.description)}

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
        codes = re.findall('[0-9]{4}', entries[0].text)
        if len(codes):
            code = codes[0]
        else:
            code = 9999
        description = re.sub('[0-9]{4}', '', util.inner_text(element))
        return DiagnosticCode(int(code), description)

    def as_dict(self):
        return {'code': self.code,
                'description': munging.strip_whitespace(self.description)}


class DiagnosticCodeSet(RatingTableObject):
    def __init__(self, header):
        self.codes = []
        self.ratings = []
        self.notes = []
        self.see_other_notes = []
        self.header = header

    def add_diagnostic_code(self, code: DiagnosticCode):
        self.codes.append(code)

    def add_see_other_note(self, see_other_note):
        self.see_other_notes.append(see_other_note)

    def add_rating(self, rating: Rating):
        if len(rating.ratings) == 1:
            self.ratings.append(SingleRating(rating.description, rating.ratings[0]))
        else:
            for idx, header_name in enumerate(self.header[1:]):
                self.ratings.append(SingleRating(rating.description + ' ({})'.format(header_name),
                                                 rating.ratings[idx]))

    def add_note(self, note: RatingNote):
        self.notes.append(note)

    def get_all_ratings(self):
        for code in self.codes:
            yield {
                'code': code.as_dict(),
                'ratings': [rating.as_dict() for rating in self.ratings],
                'header': self.header,
                'see_other_notes': [note.as_dict() for note in self.see_other_notes],
                'notes': [note.as_dict() for note in self.notes]}

    def as_dict(self):
        return {'ratings': [rating.as_dict() for rating in self.ratings],
                'codes': [code.as_dict() for code in self.codes],
                'notes': [note.as_dict() for note in self.notes],
                'see_other_notes': [note.as_dict() for note in self.see_other_notes],
                'header': self.header}


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
    def __init__(self, description: str, parent: 'RatingCategory' = None, header=None):
        self.description = description
        self.diagnostic_code_sets = []
        self.subcategories = []
        self.diagnostic_codes = []
        self.see_other_notes = []
        self.notes = []
        self.parent = parent
        self.header = header

    def add_subcategory(self, subcategory: 'RatingCategory'):
        self.subcategories.append(subcategory)

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

    def get_all_ratings(self):
        for diagnostic_code_set in self.diagnostic_code_sets:
            for rating in diagnostic_code_set.get_all_ratings():
                yield rating

    def as_dict(self):
        return {'description': munging.strip_whitespace(self.description),
                'subcategories': [x.as_dict() for x in self.subcategories],
                'ratings': list(self.get_all_ratings()),
                'notes': [x.as_dict() for x in self.notes],
                'see_other_notes': [x.as_dict() for x in self.see_other_notes]}

    def __str__(self) -> str:
        return json.dumps(self.as_dict())
