import json
import os.path

from jinja2 import Template
import Utils

# 读取JSON数据
with open('../json_files/single_list.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('../templates/template_single_list.html', 'r', encoding='utf-8') as f:
    template_string = f.read()

for item in data:
    song_title_list = item['song_title_list']
    song_data_list = []
    for song_title in song_title_list:
        song_hash = Utils.process_string(song_title)
        path_exists = os.path.exists(f'../docs/music_lib/music_call/auto-generated_md/{song_hash}.md')
        song_data_list.append({'title': song_title, 'hash': song_hash, 'exists': path_exists})
    item['song_data_list'] = song_data_list

template = Template(template_string)
rendered_html = template.render(song_list=data)
if not os.path.exists('../docs/music_lib/auto-generated_html'):
    os.makedirs('../docs/music_lib/auto-generated_html')
with open('../docs/music_lib/auto-generated_html/single_list.html', 'w', encoding='utf-8') as f:
    f.write(rendered_html)
