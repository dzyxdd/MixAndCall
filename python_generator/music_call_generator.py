import json
import os

from jinja2 import Template
import Utils

with open('../json_files/music_call.json', 'r', encoding='utf-8') as f:
    song_list = json.load(f)

with open('../templates/template_music_call.html', 'r', encoding='utf-8') as f:
    template_html_string = f.read()

with open('../templates/template_music_call.md', 'r', encoding='utf-8') as f:
    template_md_string = f.read()

for song in song_list:
    hash_string = Utils.process_string(song['title'])

    template_html = Template(template_html_string)
    rendered_html = template_html.render(music_call=song)
    generate_html_path = '../docs/music_lib/music_call/auto-generated_html/' + hash_string + '.html'

    if not os.path.exists('../docs/music_lib/music_call/auto-generated_html'):
        os.makedirs('../docs/music_lib/music_call/auto-generated_html')
    with open(generate_html_path, 'w', encoding='utf-8') as f:
        f.write(rendered_html)

    html_path = "docs/music_lib/music_call/auto-generated_html/" + hash_string + ".html"
    template_md = Template(template_md_string)
    rendered_md = template_md.render(md_href=html_path)
    generate_md_path = '../docs/music_lib/music_call/auto-generated_md/' + hash_string + '.md'

    if not os.path.exists('../docs/music_lib/music_call/auto-generated_md'):
        os.makedirs('../docs/music_lib/music_call/auto-generated_md')
    with open(generate_md_path, 'w', encoding='utf-8') as f:
        f.write(rendered_md)
