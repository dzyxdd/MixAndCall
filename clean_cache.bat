@echo off

if exist "docs/mix/auto-generated_html" rd /s /q "docs/mix/auto-generated_html"
if exist "docs/music_lib/auto-generated_html" rd /s /q "docs/music_lib/auto-generated_html"
if exist "docs/music_lib/music_call/auto-generated_html" rd /s /q "docs/music_lib/music_call/auto-generated_html"
if exist "docs/music_lib/music_call/auto-generated_md" rd /s /q "docs/music_lib/music_call/auto-generated_md"
if exist "site" rd /s /q "site"