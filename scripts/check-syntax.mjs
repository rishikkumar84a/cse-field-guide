import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const files=['web/app.js','web/features.js',...fs.readdirSync('scripts').filter(f=>f.endsWith('.mjs')).map(f=>path.join('scripts',f))];
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
console.log(`PASS: JavaScript syntax checks for ${files.length} source files. No separate style-lint engine is configured.`);
