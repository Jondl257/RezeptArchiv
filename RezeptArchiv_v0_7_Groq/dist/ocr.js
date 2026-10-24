/* Local OCR via Tesseract.js. Only engine/language files are downloaded; images stay on this device. */
(function(){
  let loading;
  const aborted=signal=>{if(signal?.aborted)throw new DOMException('Abgebrochen','AbortError');};
  function load(){
    if(window.Tesseract)return Promise.resolve(window.Tesseract);
    if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(Error('OCR konnte nicht geladen werden.'));script.onerror=()=>reject(Error('OCR-Download fehlgeschlagen. Internetverbindung prüfen; die Datei kann trotzdem als Entwurf gespeichert werden.'));document.head.append(script);}).catch(e=>{loading=null;throw e;});return loading;
  }
  async function recognize(image,{language='deu+eng',columns='auto',signal,update=()=>{}}={}){
    aborted(signal);const engine=await load();aborted(signal);let worker;
    try{
      update('Lokale OCR wird geladen …');worker=await engine.createWorker(language,1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',logger:m=>{if(m.status==='recognizing text')update('Lokale Texterkennung · '+Math.round(m.progress*100)+' %');}});aborted(signal);
      const stop=()=>{worker.terminate().catch(()=>{});};signal?.addEventListener('abort',stop,{once:true});
      try{
        await worker.setParameters({tessedit_pageseg_mode:columns==='auto'?'3':'6',preserve_interword_spaces:'1'});
        let results=[];
        if(columns==='two'){
          const bitmap=new Image();bitmap.src=image.dataUrl;await bitmap.decode();aborted(signal);const width=bitmap.naturalWidth,height=bitmap.naturalHeight,split=Math.floor(width/2);
          for(const rectangle of [{left:0,top:0,width:split,height},{left:split,top:0,width:width-split,height}]){aborted(signal);results.push((await worker.recognize(image.dataUrl,{rectangle})).data);}
        }else results.push((await worker.recognize(image.dataUrl)).data);
        aborted(signal);const text=results.map(r=>r.text?.trim()||'').filter(Boolean).join('\n\n');const confidence=Math.min(...results.map(r=>Number.isFinite(r.confidence)?r.confidence:0));
        return {text,confidence,issues:!text?['Kein lesbarer Text erkannt.']:confidence<70?['Unsichere OCR: Mengen, Brüche und Einheiten am Original prüfen.']:[]};
      }finally{signal?.removeEventListener('abort',stop);}
    }catch(e){aborted(signal);throw e;}finally{if(worker)await worker.terminate().catch(()=>{});}
  }
  window.RecipeOCR={recognize};
})();
