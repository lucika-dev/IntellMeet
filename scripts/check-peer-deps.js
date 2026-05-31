#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const semver = require('semver');

function readJSON(p){
  try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){return null}
}

const root = process.cwd();
const nm = path.join(root,'node_modules');
if(!fs.existsSync(nm)){
  console.error('node_modules not found. Run `pnpm install` first.');
  process.exit(2);
}

const astroPkg = readJSON(path.join(nm,'astro','package.json'));
if(!astroPkg){
  console.error('astro not found in node_modules.');
  process.exit(2);
}
const astroVersion = astroPkg.version;
console.log('Installed astro:', astroVersion);

let mismatches = [];

function walk(dir){
  const entries = fs.readdirSync(dir);
  for(const e of entries){
    const p = path.join(dir,e);
    let stat;
    try{ stat = fs.statSync(p); }catch(e){continue}
    if(stat.isDirectory()){
      const pkg = path.join(p,'package.json');
      if(fs.existsSync(pkg)){
        const pj = readJSON(pkg);
        if(pj && pj.peerDependencies && pj.peerDependencies.astro){
          const range = pj.peerDependencies.astro;
          if(!semver.satisfies(astroVersion, range, { includePrerelease: true })){
            mismatches.push({name: pj.name || e, version: pj.version, range});
          }
        }
      }
      // avoid recursing into .pnpm store to keep runtime reasonable
      if(!p.includes(path.join('node_modules','.pnpm'))){
        walk(p);
      }
    }
  }
}

walk(nm);

if(mismatches.length){
  console.error('Peer dependency mismatches for astro detected:');
  mismatches.forEach(m => console.error(` - ${m.name}@${m.version} expects astro ${m.range}`));
  process.exit(1);
}

console.log('All astro peerDependencies satisfied.');
process.exit(0);
