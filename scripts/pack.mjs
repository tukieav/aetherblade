import {cpSync, mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
cpSync('index.html','dist/index.html');
// Character packs stay outside the JS bundle so the loader can stream them.
cpSync('assets','dist/assets',{recursive:true});
