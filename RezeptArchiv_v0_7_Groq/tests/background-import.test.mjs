import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../frontend-groq.js',import.meta.url),'utf8');
function context(api){const c=vm.createContext({groqApi:api,DOMException,Date,Number,Math,setTimeout,clearTimeout});vm.runInContext(source.slice(source.indexOf('  function groqWait'),source.indexOf('  let groqBackgroundBusy')),c);return c;}
test('local OCR sends only text; 429 retries final formatting without redoing OCR',async()=>{
 let clock=0,failed=false,ocrCalls=0;const seen=[],waits=[];const c=context(async(op,payload)=>{seen.push(op);assert.equal(op,'extract');assert.equal(payload.images.length,0);if(!failed){failed=true;throw Object.assign(Error('limit'),{status:429,retryAfterSeconds:2});}return {requestId:payload.requestId,originalText:payload.sourceText,recipe:{issues:[]}};});c.window={RecipeOCR:{recognize:async image=>{ocrCalls++;return {text:'Zutaten und Schritte '+image.name,issues:[]};}}};c.Date={now:()=>clock};c.tick=ms=>{clock+=ms;waits.push(ms);};vm.runInContext('groqWait=async ms=>tick(ms)',c);
 const input={isPdf:true,sourceText:'',files:[{name:'recipe.pdf'}],images:[{name:'page1',dataUrl:'image1'},{name:'page2',dataUrl:'image2'}]};const result=await c.groqImportResult(input,'job',{aborted:false},()=>{});
 assert.deepEqual(seen,['extract','extract']);assert.equal(waits.reduce((a,b)=>a+b),60000);assert.equal(ocrCalls,2);assert.match(result.originalText,/page1/);assert.match(result.originalText,/page2/);
 await c.groqImportResult(input,'job',{aborted:false},()=>{});assert.equal(ocrCalls,2);
});
test('selectable PDF text bypasses OCR and all image API requests',async()=>{
 const text='Zutaten: 200 g Mehl. Zubereitung: Alles vermischen und backen.';const c=context(async(op,payload)=>{assert.equal(op,'extract');assert.equal(payload.images.length,0);assert.match(payload.sourceText,/200 g Mehl/);return {requestId:payload.requestId,originalText:payload.sourceText,recipe:{issues:[]}};});c.window={RecipeOCR:{recognize:()=>{throw Error('must not OCR text PDF');}}};
 await c.groqImportResult({isPdf:true,sourceText:'',files:[{name:'x.pdf'}],images:[{name:'Seite1',sourceText:text}]},'job',{aborted:false},()=>{});
});
test('failed OCR retains upload as incomplete draft without sending partial recipe to Groq',async()=>{
 const c=context(()=>{throw Error('must not call Groq');});c.window={RecipeOCR:{recognize:async()=>({text:'',issues:['unleserlich']})}};
 const result=await c.groqImportResult({isPdf:true,sourceText:'',files:[{name:'x.pdf'}],images:[{name:'Seite1',dataUrl:'image'}]},'job',{aborted:false},()=>{});assert.equal(result.recipe.title,'x');assert.equal(result.recipe.ingredientGroups[0].items.length,0);assert(result.recipe.issues.some(x=>x.includes('erneut mit KI')));
});
test('background save retains issues and marks imported recipe unreviewed without opening editor',async()=>{
 const state={manual:[]},edits={};let persisted=0;const c=vm.createContext({state,edits,Date,Math,checks:()=>[],persistSnapshot:async()=>{persisted++;return true;},render(){},showToast(){},openDetail(){throw Error('must not navigate');}});
 vm.runInContext(source.slice(source.indexOf('  async function showGroqDraft'),source.indexOf('  const detailBeforeGroq')),c);
 const result=await c.showGroqDraft({recipe:{title:'Kuchen',category:'Kuchen',portions:[],ingredientGroups:[{title:'Teig',items:['200 g Mehl']}],preparationSections:[{title:'Teig',steps:['Mischen']}],issues:['Prüfen']},originalText:'Quelle'}, {files:[{name:'Kuchen.pdf'}],images:[{name:'Seite1'}],originals:[{name:'Kuchen.pdf',dataUrl:'original'}]},true);
 assert.equal(persisted,1);assert.equal(result.durable,true);assert.equal(state.manual.length,1);assert.equal(state.manual[0].reviewed,false);assert(state.manual[0].issues.includes('Prüfen'));assert.equal(edits[result.id],state.manual[0]);
});
test('429 respects longer provider delays and caps automatic retries',async()=>{let clock=0,calls=0;const c=context(async()=>{calls++;throw Object.assign(Error('limit'),{status:429,retryAfterSeconds:90});});c.Date={now:()=>clock};c.tick=ms=>{clock+=ms;};vm.runInContext('groqWait=async ms=>tick(ms)',c);await assert.rejects(()=>c.groqWithRetry('extract',{}, {aborted:false},()=>{}));assert.equal(calls,4);assert.equal(clock,270000);});
