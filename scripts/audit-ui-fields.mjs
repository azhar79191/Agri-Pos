import fs from 'node:fs';
import path from 'node:path';
import {parse} from '@babel/parser';
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
function walk(n,fn,anc=[]){if(!n||typeof n!=='object')return;fn(n,anc);for(const [k,v] of Object.entries(n)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn,[...anc,n]));else if(v&&typeof v==='object')walk(v,fn,[...anc,n]);}}
const unresolved=[];
for(const file of files('src').filter(f=>f.endsWith('.jsx')&&!f.includes('.test.')&&!f.includes(path.join('components','ui')))){
 const s=fs.readFileSync(file,'utf8');walk(parse(s,{sourceType:'module',plugins:['jsx']}),(n,anc)=>{if(n.type!=='JSXElement'||!['input','textarea','select','Input','Select','SearchableSelect'].includes(n.openingElement.name.name))return;
 const attrs=n.openingElement.attributes;const has=name=>attrs.some(a=>a.name?.name===name);if(has('label')||has('aria-label')||has('aria-labelledby')||has('id')||attrs.some(a=>a.name?.name==='type'&&a.value?.value==='hidden')||anc.some(x=>x.type==='JSXElement'&&['FormField','label'].includes(x.openingElement.name.name)))return;
 unresolved.push({file,line:n.loc.start.line,control:s.slice(n.start,n.openingElement.end).replace(/\s+/g,' ').slice(0,230)});
 });
}
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/ui-field-audit.json',JSON.stringify(unresolved,null,2));console.log(JSON.stringify(unresolved,null,2));
