import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export default defineConfig({ plugins: [react(), {
 name:'versionar-cache-offline',apply:'build',
 async closeBundle(){
  const html=await readFile('dist/index.html','utf8'),worker=await readFile('public/sw.js','utf8');
  const hash=createHash('sha256').update(html+worker);
  for(const name of ['the-sun','the-moon','strength','justice','card-back'])hash.update(await readFile('public/tarot/'+name+'.png'));
  const version=hash.digest('hex').slice(0,12);
  await writeFile('dist/sw.js',worker.replace('__CACHE_VERSION__',version));
 }
}], test: { environment: 'node' } });
