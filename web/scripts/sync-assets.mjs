import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.join(root, 'content', 'assets');
const dest = path.join(root, 'web', 'public', 'assets');

/**
 * 覆盖复制，避免先 rm 再 cp：开发服务器占用文件时整树删除
 * 会导致部分作者目录（如 Tokiho）暂时/持续 404。
 */
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true, force: true });
console.log(`synced assets -> ${dest}`);
