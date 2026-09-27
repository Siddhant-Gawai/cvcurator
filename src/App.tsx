import {useEffect,useRef,useState} from 'react';
import {Alert,Dropdown,Label,Description,Separator,ToggleButton,ToggleButtonGroup} from '@heroui/react';
import {DndContext,closestCenter,KeyboardSensor,PointerSensor,useSensor,useSensors} from '@dnd-kit/core';
import {SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ArrowDown,ArrowUp,ArrowUpRight,BriefcaseBusiness,Check,CheckCheck,ChevronDown,ChevronRight,Download,Eye,EyeOff,FileJson,FileText,GraduationCap,GripVertical,Languages,LayoutTemplate,LockKeyhole,Minus,PanelLeft,Plus,RotateCcw,Settings2,ShieldCheck,Sparkles,Trash2,Upload,UserRound,Award,FolderOpen,X} from 'lucide-react';
import {Button} from './components/ui/button';
import {ConfirmDialog} from './components/ui/alert-dialog';
import {ContactForm,SectionForm} from './Forms';
import {Design} from './Design';
import {Preview,useGeneratedPDF} from './Preview';
import {useCV,storageStatus} from './store';
import {blankCV,exampleCV,kinds,move,names,parseBackup,serializeBackup,type CV,type Kind} from './model';

const icons={contact:UserRound,summary:FileText,experience:BriefcaseBusiness,education:GraduationCap,projects:FolderOpen,skills:Sparkles,certifications:Award,languages:Languages};
function download(blob:Blob,name:string) {
 const url=URL.createObjectURL(blob);const link=document.createElement('a');
 link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}

function SectionNav({section,active,onSelect}:{section:CV['sections'][number];active:boolean;onSelect:()=>void}) {
 const {attributes,listeners,setNodeRef,transform,transition}=useSortable({id:section.id});
 const Icon=icons[section.id];const count=section.entries.length;
 return <div ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition}} className={`nav-row ${active?'selected':''} ${section.hidden?'muted':''}`}>
  <Button variant="ghost" size="icon" className="drag-handle" {...attributes} {...listeners} title="Drag to reorder. Keyboard: Space, arrow keys, then Space." aria-label={`Drag ${names[section.id]} section`}><GripVertical size={14}/></Button>
  <Button variant="ghost" className="nav-select" aria-label={names[section.id]} aria-current={active?'step':undefined} onPress={onSelect}>
   <Icon size={17}/><span>{names[section.id]}</span>
   {section.hidden?<span className="entry-count" title="Hidden from your CV"><EyeOff size={13}/></span>:<span className="entry-count">{count} {count===1?'entry':'entries'}</span>}
  </Button>
 </div>;
}

export default function App() {
 const cv=useCV(state=>state.cv);const revision=useCV(state=>state.revision);
 const update=useCV(state=>state.update);const replace=useCV(state=>state.replace);
 const [active,setActive]=useState<Kind|'contact'>('contact');
 const [tab,setTab]=useState<'content'|'design'>('content');
 const [mobile,setMobile]=useState<'edit'|'preview'>('edit');
 const [zoom,setZoom]=useState(100);const [pages,setPages]=useState(0);const [message,setMessage]=useState('');
 const [previewOpen,setPreviewOpen]=useState(false);
 const [confirm,setConfirm]=useState<{title:string;description:string;action:()=>void}|null>(null);
 const input=useRef<HTMLInputElement>(null);const pdf=useGeneratedPDF(cv);
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 const ask=(title:string,description:string,action:()=>void)=>setConfirm({title,description,action});
 const reorder=(from:number,to:number)=>update(cv=>({...cv,sections:move(cv.sections,from,to)}));
 const activeSection=cv.sections.find(section=>section.id===active);const ActiveIcon=icons[active];
 const missing=kinds.filter(id=>!cv.sections.some(section=>section.id===id));
 const startBlank=()=>ask('Start with a blank CV?','This clears your content and restores the default design. Export a backup first if you want to keep your work.',()=>{replace(blankCV());setActive('contact');setMessage('A fresh page. Start with your personal details.');});
 const resetExample=()=>ask('Reset to the example CV?','This replaces your content and design with the example. Export a backup first if you want to keep your work.',()=>{replace(exampleCV());setActive('contact');});
 useEffect(()=>{if(!previewOpen)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setPreviewOpen(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[previewOpen]);
 async function importFile(file?:File) {
  if(!file)return;
  try {
   if(file.size>3_000_000)throw Error();
   const imported=parseBackup(await file.text());
   ask('Replace your current CV?','The backup will replace your current content and design. Export your current CV as a backup first if you want to keep it.',()=>{replace(imported);setActive('contact');setMessage('Backup imported. Your CV is ready to edit.');});
  } catch {setMessage('This backup could not be imported. Choose a valid Folio JSON backup (version 1, under 3 MB).');}
  if(input.current)input.current.value='';
 }
 return <div className="app-shell">
  <header className="app-header">
   <a className="brand" href="#" aria-label="Folio home"><span className="brand-mark">f<span>·</span></span><span>folio<span className="brand-dot">.</span></span></a>
   <div className="header-divider"/><div className="document-title"><span>My resume</span><small>PERSONAL WORKSPACE</small></div>
   <div className="header-actions">
    <span className="save-state"><CheckCheck size={15}/>{storageStatus()?'Saving unavailable':'Saved on this device'}</span>
    <Dropdown>
     <Button variant="outline" aria-label="Backup"><FileJson size={16}/><span className="desktop-label">Backup</span><ChevronDown size={14}/></Button>
     <Dropdown.Popover placement="bottom end" className="folio-menu-popover"><Dropdown.Menu aria-label="CV backup and reset">
      <Dropdown.Item id="export" textValue="Export JSON backup" onAction={()=>{download(new Blob([serializeBackup(cv)],{type:'application/json'}),'folio-backup.json');setMessage('Backup exported. Keep it somewhere safe.');}}><Download size={18}/><div><Label>Export backup</Label><Description>Save your editable CV as JSON</Description></div></Dropdown.Item>
      <Dropdown.Item id="import" textValue="Import JSON backup" onAction={()=>input.current?.click()}><Upload size={18}/><div><Label>Import backup</Label><Description>Restore a previously saved CV</Description></div></Dropdown.Item>
      <Separator/>
      <Dropdown.Item id="blank" textValue="Start blank" onAction={startBlank}><FileText size={18}/><div><Label>Start blank</Label><Description>Begin with an empty document</Description></div></Dropdown.Item>
      <Dropdown.Item id="reset" textValue="Reset example" onAction={resetExample}><RotateCcw size={18}/><div><Label>Reset example</Label><Description>Return to the original example</Description></div></Dropdown.Item>
     </Dropdown.Menu></Dropdown.Popover>
    </Dropdown>
    <Button disabled={pdf.busy||!!pdf.error} onPress={()=>{if(pdf.blob)download(pdf.blob,`${cv.contact.name.trim()||'My'}-CV.pdf`);}}><Download size={16}/><span>Download PDF</span></Button>
   </div>
   <input ref={input} type="file" accept=".json,application/json" hidden aria-label="Import backup file" onChange={event=>void importFile(event.target.files?.[0])}/>
  </header>
  <div className="mobile-switch"><ToggleButtonGroup aria-label="Mobile view" selectionMode="single" disallowEmptySelection selectedKeys={[mobile]} onSelectionChange={keys=>setMobile([...keys][0] as 'edit'|'preview')}>
   <ToggleButton id="edit"><PanelLeft size={16}/>Edit CV</ToggleButton><ToggleButton id="preview"><Eye size={16}/>Preview</ToggleButton>
  </ToggleButtonGroup></div>
  <main className={`workspace mobile-${mobile}`}>
   <aside className="sidebar">
    <div className="sidebar-top"><p className="eyebrow">YOUR DOCUMENT</p><h1>Make it yours.</h1><p>A clear story. A confident next step.</p></div>
    <ToggleButtonGroup className="editor-tabs" aria-label="Editor mode" selectionMode="single" disallowEmptySelection selectedKeys={[tab]} onSelectionChange={keys=>setTab([...keys][0] as 'content'|'design')}>
     <ToggleButton id="content"><FileText size={16}/>Content</ToggleButton><ToggleButton id="design"><Settings2 size={16}/>Design</ToggleButton>
    </ToggleButtonGroup>
    <div className="sidebar-navigation">{tab==='content'?<>
     <div className="nav-label">CV SECTIONS</div>
     <Button variant="ghost" className={`contact-nav ${active==='contact'?'selected':''}`} onPress={()=>setActive('contact')}><UserRound size={17}/><span>Personal details</span><Check size={14}/></Button>
     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active:dragged,over})=>{if(over)reorder(cv.sections.findIndex(section=>section.id===dragged.id),cv.sections.findIndex(section=>section.id===over.id));}}>
      <SortableContext items={cv.sections.map(section=>section.id)} strategy={verticalListSortingStrategy}>{cv.sections.map(section=><SectionNav key={section.id} section={section} active={active===section.id} onSelect={()=>setActive(section.id)}/>)}</SortableContext>
     </DndContext>
     {missing.length>0&&<Dropdown><Button variant="ghost" className="add-section"><Plus size={16}/>Add a section<ChevronDown size={14}/></Button><Dropdown.Popover className="folio-menu-popover"><Dropdown.Menu aria-label="Add section">{missing.map(id=>{const Icon=icons[id];return <Dropdown.Item key={id} id={id} textValue={names[id]} onAction={()=>{update(cv=>({...cv,sections:[...cv.sections,{id,hidden:false,entries:[]}]}));setActive(id);}}><Icon size={17}/><Label>{names[id]}</Label></Dropdown.Item>;})}</Dropdown.Menu></Dropdown.Popover></Dropdown>}
     <p className="reorder-hint"><GripVertical size={13}/>Drag to reorder your sections</p>
    </>:<div className="design-nav"><LayoutTemplate size={20}/><h3>Your style, on paper.</h3><p>Fine-tune the details. Your preview updates as you go.</p><span>2 templates · 24 fonts</span></div>}</div>
    <div className="sidebar-bottom"><div><ShieldCheck size={18}/><span>Yours. And only yours.<small>Your CV stays on this device.</small></span></div><Button variant="ghost" onPress={startBlank}>Start blank<ArrowUpRight size={14}/></Button></div>
   </aside>
   <section className="editor-panel">
    <div className="editor-heading"><div className="section-icon">{tab==='design'?<Settings2 size={20}/>:<ActiveIcon size={20}/>}</div><div><p className="eyebrow">{tab==='design'?'THE FINISHING TOUCHES':'BUILD YOUR STORY'}</p><h2>{tab==='design'?'Design & layout':names[active]}</h2></div>
     {tab==='content'&&activeSection&&<div className="section-actions">
      <Button variant="ghost" size="icon" title={`${activeSection.hidden?'Show':'Hide'} section`} aria-label={`${activeSection.hidden?'Show':'Hide'} ${names[active]} section`} onPress={()=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===active?{...section,hidden:!section.hidden}:section)}))}>{activeSection.hidden?<EyeOff size={18}/>:<Eye size={18}/>}</Button>
      <Button variant="ghost" size="icon" title="Delete section" aria-label={`Delete ${names[active]} section`} onPress={()=>ask(`Delete ${names[active]}?`,'All entries in this section will be removed. You can add an empty section again from the sidebar.',()=>{update(cv=>({...cv,sections:cv.sections.filter(section=>section.id!==active)}));setActive('contact');})}><Trash2 size={16}/></Button>
     </div>}
    </div>
    <p className="editor-description">{tab==='design'?'Good typography makes your story easier to read.':active==='contact'?'Let people know who you are and how to reach you.':active==='summary'?'A brief introduction to your strengths and ambitions.':`Highlight your ${names[active].toLowerCase()} with the details that matter.`}</p>
    {tab==='content'&&activeSection&&<div className="section-order"><span>Section order</span><Button variant="outline" size="sm" disabled={cv.sections.indexOf(activeSection)===0} onPress={()=>{const i=cv.sections.indexOf(activeSection);reorder(i,i-1);}}><ArrowUp size={14}/>Move up</Button><Button variant="outline" size="sm" disabled={cv.sections.indexOf(activeSection)===cv.sections.length-1} onPress={()=>{const i=cv.sections.indexOf(activeSection);reorder(i,i+1);}}><ArrowDown size={14}/>Move down</Button></div>}
    {activeSection?.hidden&&tab==='content'&&<Alert status="warning" className="section-notice"><Alert.Indicator><EyeOff size={17}/></Alert.Indicator><Alert.Content><Alert.Description>This section is hidden from your CV.</Alert.Description></Alert.Content></Alert>}
    <div key={`${revision}-${tab}-${active}`} className="editor-content">{tab==='design'?<Design/>:active==='contact'?<>
     <div className="section-label">THE ESSENTIALS</div><ContactForm/>
     <div className="tip"><LockKeyhole size={18}/><p>Only include details you’re comfortable sharing. Your full address and photo aren’t needed.</p></div>
     <div className="next-section"><span>Next, a little about you.</span><Button variant="outline" onPress={()=>{if(!cv.sections.some(section=>section.id==='summary'))update(cv=>({...cv,sections:[{id:'summary',hidden:false,entries:[]},...cv.sections]}));setActive('summary');}}>Write your profile<ChevronRight size={15}/></Button></div>
    </>:<SectionForm kind={active} confirm={ask}/>}</div>
    <div className="editor-footer"><LockKeyhole size={12}/><span>No account. No uploads. Just your next chapter.</span></div>
   </section>
   <section className="preview-panel" aria-label="Live CV preview">
    <div className="preview-toolbar"><div><span className="live-dot"/><strong>Live preview</strong><span className="preview-size">{cv.settings.paper==='LETTER'?'US Letter':'A4'}</span></div><div className="zoom-control">
     <Button variant="ghost" size="icon" aria-label="Zoom out" disabled={zoom<=60} onPress={()=>setZoom(value=>value-10)}><Minus size={15}/></Button><Button variant="ghost" aria-label="Reset zoom" onPress={()=>setZoom(100)}>{zoom}%</Button><Button variant="ghost" size="icon" aria-label="Zoom in" disabled={zoom>=150} onPress={()=>setZoom(value=>value+10)}><Plus size={15}/></Button>
    </div></div>
    <div className="preview-status" role="status">{pdf.error||(pdf.busy?'Updating your preview…':`${pages} ${pages===1?'page':'pages'} · ${cv.settings.template==='classic'?'Essential':'Modern'} template`)}</div>
    <div className="preview-click-target" role="button" tabIndex={0} aria-label="Open CV preview" onClick={()=>setPreviewOpen(true)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' ')setPreviewOpen(true);}}><Preview blob={pdf.blob} zoom={zoom} onPages={setPages}/></div>
    <div className="preview-bottom"><span><Check size={13}/>What you see is what you download.</span><span>PDF · Selectable text</span></div>
   </section>
  </main>
  {previewOpen&&<div className="preview-modal-backdrop" role="presentation" onClick={()=>setPreviewOpen(false)}><div className="preview-modal" role="dialog" aria-modal="true" aria-label="CV preview" onClick={event=>event.stopPropagation()}><div className="preview-modal-header"><div><strong>CV preview</strong><span>Click outside or press Escape to close</span></div><Button variant="ghost" size="icon" aria-label="Close CV preview" onPress={()=>setPreviewOpen(false)}><X size={19}/></Button></div><div className="preview-modal-body"><Preview blob={pdf.blob} zoom={zoom} onPages={()=>{}}/></div></div></div>}
  {(message||storageStatus())&&<Alert className="app-notification" status={storageStatus()?'warning':'default'} role="status"><Alert.Content><Alert.Description>{storageStatus()||message}</Alert.Description></Alert.Content><Button variant="ghost" size="icon" onPress={()=>setMessage('')} aria-label="Dismiss notification"><X size={16}/></Button></Alert>}
  <ConfirmDialog open={!!confirm} title={confirm?.title||''} description={confirm?.description||''} onCancel={()=>setConfirm(null)} onConfirm={()=>{confirm?.action();setConfirm(null);}}/>
 </div>;
}

