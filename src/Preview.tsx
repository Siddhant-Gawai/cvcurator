import {useEffect,useRef,useState} from 'react';
import {pdf} from '@react-pdf/renderer';
import {getDocument,GlobalWorkerOptions,type PDFDocumentLoadingTask,type PDFPageProxy} from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {CVDocument} from './pdf';
import type {CV} from './model';
GlobalWorkerOptions.workerSrc=worker;
export function useGeneratedPDF(cv:CV){
 const [result,setResult]=useState<{blob:Blob;url:string;cv:CV}|null>(null);
 const [failure,setFailure]=useState<{cv:CV;message:string}|null>(null);
 const latest=useRef(cv); latest.current=cv; const running=useRef(false); const queued=useRef<CV|null>(null);const alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{const timer=setTimeout(()=>{queued.current=cv;void run();},550);async function run(){if(running.current)return;running.current=true;while(queued.current){const next=queued.current;queued.current=null;try{const blob=await pdf(<CVDocument cv={next}/>).toBlob();if(alive.current&&next===latest.current){setResult({blob,url:URL.createObjectURL(blob),cv:next});setFailure(null);}}catch{if(alive.current&&next===latest.current)setFailure({cv:next,message:'We could not prepare your PDF. Try another font or reload the app.'});}}running.current=false;}return()=>clearTimeout(timer);},[cv]);
 useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url);},[result]);
 const error=failure?.cv===cv?failure.message:'';
 return {...result,error,busy:!error&&(!result||result.cv!==cv)};
}
function Paper({page,scale}:{page:PDFPageProxy;scale:number}){const canvas=useRef<HTMLCanvasElement>(null);useEffect(()=>{const viewport=page.getViewport({scale:scale*2});const target=canvas.current!;target.width=viewport.width;target.height=viewport.height;const task=page.render({canvas:target,viewport});task.promise.catch(()=>{});return()=>task.cancel();},[page,scale]);const v=page.getViewport({scale});return <canvas ref={canvas} className="pdf-paper" style={{width:v.width,height:v.height}} role="img" aria-label={`CV preview, page ${page.pageNumber}. Download the PDF for selectable text and links.`}/>;}
export function Preview({blob,zoom,onPages}:{blob?:Blob;zoom:number;onPages:(n:number)=>void}) {
 const [pages,setPages]=useState<PDFPageProxy[]>([]);
 const [width,setWidth]=useState(700);
 const [error,setError]=useState('');
 const container=useRef<HTMLDivElement>(null);
 const onPagesRef=useRef(onPages);
 useEffect(()=>{onPagesRef.current=onPages;},[onPages]);
 useEffect(()=>{
  const observer=new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(next>0)setWidth(next);});
  if(container.current)observer.observe(container.current);
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  let cancelled=false;let task:PDFDocumentLoadingTask|undefined;
  async function load() {
   if(!blob)return;
   try {
    const data=await blob.arrayBuffer();if(cancelled)return;
    task=getDocument({data});const doc=await task.promise;
    const next=await Promise.all(Array.from({length:doc.numPages},(_,index)=>doc.getPage(index+1)));
    if(!cancelled){setPages(next);setError('');onPagesRef.current(doc.numPages);}
   }catch{if(!cancelled)setError('Preview could not load. You can still download your PDF.');}
  }
  void load();
  return()=>{cancelled=true;void task?.destroy();};
 },[blob]);
 return <div className="paper-scroll" ref={container}>
  {error?<p className="preview-loading" role="alert">{error}</p>:pages.length?pages.map(page=><div className="paper-wrap" key={`${blob?.size}-${page.pageNumber}`}>
   <Paper page={page} scale={Math.max(.25,Math.min((width-64)/page.getViewport({scale:1}).width,1.15))*zoom/100}/>
   <span className="paper-caption">PAGE {page.pageNumber} OF {pages.length}</span>
  </div>):<div className="preview-loading"><span className="spinner"/>Preparing your document…</div>}
 </div>;
}

