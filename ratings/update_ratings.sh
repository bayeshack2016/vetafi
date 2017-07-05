#!/bin/bash
# Update the ratings JSON files and save into the static assets of vetafi-web.

source VE/bin/activate

./parse_tables.py --input-files CFR-2016-title38-vol1.xml CFR-2016-title38-vol2.xml --output-dir ../hardhome/conf/ratings/ $@
