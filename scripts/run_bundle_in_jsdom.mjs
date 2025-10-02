import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const indexHtmlPath = path.resolve('dist/public/index.html');
const bundlePath = path.resolve('dist/public/assets/index-WPLG5R77.js');

const html = fs.readFileSync(indexHtmlPath, 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost:5000/' });
const { window } = dom;

// Proxy important globals to the Node global so the module sees them
Object.defineProperty(global, 'window', { value: window, configurable: true, writable: true });
Object.defineProperty(global, 'document', { value: window.document, configurable: true, writable: true });
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true, writable: true });
Object.defineProperty(global, 'location', { value: window.location, configurable: true, writable: true });
Object.defineProperty(global, 'HTMLElement', { value: window.HTMLElement, configurable: true, writable: true });
Object.defineProperty(global, 'Node', { value: window.Node, configurable: true, writable: true });
Object.defineProperty(global, 'CustomEvent', { value: window.CustomEvent, configurable: true, writable: true });

// Capture console
const consoleLogs = [];
['log','info','warn','error'].forEach(level=>{
  const orig = console[level].bind(console);
  console[level] = (...args)=>{
    consoleLogs.push({level, args: args.map(a=>{
      try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(e){ return String(a); }
    })});
    orig(...args);
  };
});

// Also capture window.console
window.console = console;

// Minimal MutationObserver polyfill for jsdom environment
if (typeof window.MutationObserver === 'undefined') {
  class MutationObserverPolyfill {
    constructor(cb) { this.cb = cb }
    observe() {}
    disconnect() {}
  }
  window.MutationObserver = MutationObserverPolyfill;
  Object.defineProperty(global, 'MutationObserver', { value: MutationObserverPolyfill, configurable: true, writable: true });
}

async function run(){
  try{
    // dynamic import the bundle as an ESM module
    const url = 'file://' + bundlePath;
    await import(url);
    // wait a bit for async tasks
    await new Promise(r=>setTimeout(r,2000));
    fs.writeFileSync('jsdom-console.json', JSON.stringify(consoleLogs, null, 2));
    fs.writeFileSync('jsdom-index.html', window.document.documentElement.outerHTML);
    console.log('OK');
  }catch(err){
    fs.writeFileSync('jsdom-console.json', JSON.stringify(consoleLogs, null, 2));
    fs.writeFileSync('jsdom-error.txt', err.stack || String(err));
    console.error('ERR', err.stack || err.message || err);
    process.exit(1);
  }
}

run();
