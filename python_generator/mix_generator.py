import json
import os

from jinja2 import Template


def custom_sort(tag):
    if tag.endswith('小節'):
        return 0, int(tag[:-2])
    else:
        return 1, tag


with open('../json_files/mix_list.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('../templates/template_mix.html', 'r', encoding='utf-8') as f:
    template_string = f.read()

# 对每个mix的mix_tag_list进行排序和去重
for mix in data:
    mix['mix_tag_list'] = list(set(mix['mix_tag_list']))
    mix['mix_tag_list'].sort(key=custom_sort)

template = Template(template_string)
rendered_html = template.render(mix_list=data)

if not os.path.exists('../docs/mix/auto-generated_html'):
    os.makedirs('../docs/mix/auto-generated_html')
with open('../docs/mix/auto-generated_html/mix.html', 'w', encoding='utf-8') as f:
    f.write(rendered_html)
