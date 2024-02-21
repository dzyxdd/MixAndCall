import json
import os

from jinja2 import Template


with open('../json_files/mix_list.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('../templates/template_mix.html', 'r', encoding='utf-8') as f:
    template_string = f.read()

template = Template(template_string)
rendered_html = template.render(mix_list=data)

if not os.path.exists('../docs/mix/auto-generated_html'):
    os.makedirs('../docs/mix/auto-generated_html')
with open('../docs/mix/auto-generated_html/mix.html', 'w', encoding='utf-8') as f:
    f.write(rendered_html)