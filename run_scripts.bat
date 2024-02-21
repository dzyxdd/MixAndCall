@echo off

pip install -r requirements.txt

cd python_generator
python mix_generator.py
python music_call_generator.py
python stage_list_generator.py
python EP_and_album_list_generator.py
python single_list_generator.py

cd ..