#!/bin/bash

pip install -r requirements.txt

cd python_generator
python mix_generator.py
python music_call_generator.py
python stage_list_generator.py

cd ..