import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validateExtraction} from '../server/api.mjs';
test('PDF retains text and renders every page, including dough and filling',async()=>{
 const source=readFileSync(new URL('../frontend-groq.js',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('  async function pdfImages'),source.indexOf('  const importBeforeGroq'));
 const rendered=[];let destroyed=false;
 const pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:2,getPage:async n=>({getTextContent:async()=>({items:[{str:n===1?'Teig: 200 g Mehl':'Füllung: 100 g Zucker',hasEOL:true}]}),getViewport:()=>({width:600,height:800}),render:()=>{rendered.push(n);return {promise:Promise.resolve()};},cleanup(){}})}),destroy:async()=>{destroyed=true;}})};
 const context=vm.createContext({window:{pdfjsLib},pdfjsLib,Uint8Array,document:{createElement:()=>({getContext:()=>({}),toDataURL:()=> 'data:image/jpeg;base64,/9j/'})}});
 vm.runInContext(fn+';globalThis.readPdf=pdfImages;',context);
 const images=await context.readPdf({name:'Kuchen.pdf',arrayBuffer:async()=>new ArrayBuffer(1)});
 assert.deepEqual(rendered,[1,2]);assert.equal(images.length,2);assert.match(images[0].sourceText,/Teig/);assert.match(images[1].sourceText,/Füllung/);assert.equal(destroyed,true);
});
test('empty OCR and missing recipe sections are rejected',()=>{
 const good={originalText:'Teig und Füllung',recipe:{title:'Kuchen',category:'Kuchen',portions:[],ingredientGroups:[{title:'Teig',items:['200 g Mehl']}],preparationSections:[{title:'Teig',steps:['Vermischen.']}],issues:[]}};
 assert.doesNotThrow(()=>validateExtraction(good));
 for(const bad of [{...good,originalText:' '},{...good,recipe:{...good.recipe,ingredientGroups:[]}},{...good,recipe:{...good.recipe,preparationSections:[{title:'Zubereitung',steps:[' ']}]}}])assert.throws(()=>validateExtraction(bad),e=>e.code==='INCOMPLETE_RECIPE');
});
