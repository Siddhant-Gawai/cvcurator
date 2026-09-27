import {useEffect} from 'react';
import {Controller,useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {TextField,Label,InputGroup,FieldError} from '@heroui/react';
import {DndContext,closestCenter,KeyboardSensor,PointerSensor,useSensor,useSensors} from '@dnd-kit/core';
import {SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ArrowDown,ArrowUp,CalendarDays,Eye,EyeOff,Globe,GripVertical,Link,Linkedin,Mail,MapPin,Phone,Plus,Trash2,BriefcaseBusiness,UserRound,Type,Building2,AlignLeft,type LucideIcon} from 'lucide-react';
import {useCV} from './store';
import {contactValidation,emptyEntry,move,names,type Contact,type Entry,type Kind} from './model';
import {Button} from './components/ui/button';

type Field={key:string;label:string;placeholder?:string;wide?:boolean;area?:boolean;icon?:LucideIcon};
const contactFields:Field[]=[
 {key:'name',label:'Full name',placeholder:'e.g. Alex Morgan',icon:UserRound},
 {key:'headline',label:'Professional title',placeholder:'e.g. Product Designer',icon:BriefcaseBusiness},
 {key:'email',label:'Email address',placeholder:'you@example.com',icon:Mail},
 {key:'phone',label:'Phone number',placeholder:'+44 7700 900123',icon:Phone},
 {key:'location',label:'Location',placeholder:'City, Country',wide:true,icon:MapPin},
 {key:'website',label:'Website / portfolio',placeholder:'yourportfolio.com',icon:Globe},
 {key:'linkedin',label:'LinkedIn',placeholder:'linkedin.com/in/yourname',icon:Linkedin},
];
export function ContactForm() {
 const contact=useCV(state=>state.cv.contact);const update=useCV(state=>state.update);
 const {control,subscribe}=useForm<Contact>({defaultValues:contact,resolver:zodResolver(contactValidation),mode:'onChange'});
 useEffect(()=>subscribe({formState:{values:true},callback:({values})=>update(cv=>({...cv,contact:values as Contact}))}),[subscribe,update]);
 return <div className="field-grid">{contactFields.map(definition=>{
  const Icon=definition.icon!;
  return <Controller key={definition.key} name={definition.key as keyof Contact} control={control} render={({field,fieldState})=><TextField className={`folio-field ${definition.wide?'wide':''}`} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} isInvalid={!!fieldState.error} validationBehavior="aria">
   <Label>{definition.label}</Label><InputGroup><InputGroup.Prefix><Icon size={16}/></InputGroup.Prefix><InputGroup.Input ref={field.ref} placeholder={definition.placeholder} maxLength={1000}/></InputGroup>{fieldState.error&&<FieldError>{fieldState.error.message}</FieldError>}
  </TextField>}/>;
 })}</div>;
}
function fields(kind:Kind):Field[] {
 if(kind==='summary')return [{key:'description',label:'Professional summary',placeholder:'Introduce yourself, your strengths and what you are looking for.',area:true,wide:true}];
 if(kind==='skills')return [{key:'title',label:'Skill group',placeholder:'e.g. Design',icon:Type},{key:'description',label:'Skills',placeholder:'e.g. Research, Prototyping, Figma',wide:true,area:true}];
 if(kind==='languages')return [{key:'title',label:'Language',placeholder:'e.g. English',icon:Globe},{key:'subtitle',label:'Proficiency',placeholder:'e.g. Native, B2, Conversational',icon:Type}];
 return [
  {key:'title',label:kind==='education'?'Degree / qualification':kind==='projects'?'Project name':kind==='certifications'?'Certification':'Job title',wide:true,icon:Type},
  {key:'subtitle',label:kind==='education'?'Institution':kind==='certifications'?'Issuer':kind==='projects'?'Project type / role':'Employer',icon:Building2},
  {key:'location',label:'Location',icon:MapPin},
  {key:'start',label:kind==='certifications'?'Date issued':'Start date',placeholder:'e.g. Jun 2025',icon:CalendarDays},
  {key:'end',label:kind==='certifications'?'Expiry (optional)':'End date',placeholder:'e.g. Present',icon:CalendarDays},
  {key:'description',label:'Description',placeholder:'Describe your contribution and outcomes. Use a new line for each point.',wide:true,area:true},
  {key:'url',label:'Link (optional)',placeholder:'https://example.com',wide:true,icon:Link},
 ];
}
type EntryDraft=Omit<Entry,'id'|'hidden'>;
function EntryFields({entry,kind}:{entry:Entry;kind:Kind}) {
 const update=useCV(state=>state.update);
 const {id:_id,hidden:_hidden,...draft}=entry;
 const {control,subscribe}=useForm<EntryDraft>({defaultValues:draft});
 useEffect(()=>subscribe({formState:{values:true},callback:({values})=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===kind?{...section,entries:section.entries.map(item=>item.id===entry.id?{...item,...values}:item)}:section)}))}),[subscribe,update,kind,entry.id]);
 return <div className="field-grid">{fields(kind).map(definition=>{
  const Icon=definition.icon||AlignLeft;
  return <Controller key={definition.key} name={definition.key as keyof EntryDraft} control={control} render={({field})=><TextField className={`folio-field ${definition.wide?'wide':''}`} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
   <Label>{definition.label}</Label><InputGroup>{!definition.area&&<InputGroup.Prefix><Icon size={15}/></InputGroup.Prefix>}{definition.area?<InputGroup.TextArea ref={field.ref} rows={kind==='summary'?7:4} maxLength={12000} placeholder={definition.placeholder}/>:<InputGroup.Input ref={field.ref} maxLength={1000} placeholder={definition.placeholder||`Enter ${definition.label.toLowerCase()}`}/>}</InputGroup>
  </TextField>}/>;
 })}</div>;
}
function EntryCard({entry,kind,index,total,onDelete,onMove}:{entry:Entry;kind:Kind;index:number;total:number;onDelete:()=>void;onMove:(to:number)=>void}) {
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:entry.id});const update=useCV(state=>state.update);
 return <div ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition,opacity:isDragging?.4:1}} className={`entry-card ${entry.hidden?'entry-hidden':''}`}>
  <div className="entry-toolbar"><div className="entry-title"><Button variant="ghost" size="icon" className="drag-handle" {...attributes} {...listeners} aria-label={`Drag entry ${index+1}`}><GripVertical size={16}/></Button><span>{entry.title||`${names[kind]} ${index+1}`}</span></div>
   <div className="entry-actions"><Button variant="ghost" size="icon" disabled={index===0} title="Move entry up" aria-label={`Move entry ${index+1} up`} onPress={()=>onMove(index-1)}><ArrowUp size={15}/></Button><Button variant="ghost" size="icon" disabled={index===total-1} title="Move entry down" aria-label={`Move entry ${index+1} down`} onPress={()=>onMove(index+1)}><ArrowDown size={15}/></Button><Button variant="ghost" size="icon" title={entry.hidden?'Show entry':'Hide entry'} aria-label={`${entry.hidden?'Show':'Hide'} entry ${index+1}`} onPress={()=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===kind?{...section,entries:section.entries.map(item=>item.id===entry.id?{...item,hidden:!item.hidden}:item)}:section)}))}>{entry.hidden?<EyeOff size={15}/>:<Eye size={15}/>}</Button><Button variant="ghost" size="icon" title="Delete entry" aria-label={`Delete entry ${index+1}`} onPress={onDelete}><Trash2 size={15}/></Button></div>
  </div><EntryFields entry={entry} kind={kind}/>{entry.hidden&&<p className="hidden-note">Hidden from your CV. Your content is saved.</p>}
 </div>;
}
export function SectionForm({kind,confirm}:{kind:Kind;confirm:(title:string,description:string,action:()=>void)=>void}) {
 const section=useCV(state=>state.cv.sections.find(section=>section.id===kind));const update=useCV(state=>state.update);
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 if(!section)return null;
 const reorder=(from:number,to:number)=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===kind?{...section,entries:move(section.entries,from,to)}:section)}));
 return <><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active,over})=>{if(over)reorder(section.entries.findIndex(entry=>entry.id===active.id),section.entries.findIndex(entry=>entry.id===over.id));}}><SortableContext items={section.entries.map(entry=>entry.id)} strategy={verticalListSortingStrategy}>
  {section.entries.map((entry,index)=><EntryCard key={entry.id} entry={entry} kind={kind} index={index} total={section.entries.length} onMove={to=>reorder(index,to)} onDelete={()=>confirm('Delete this entry?','This entry will be removed from your CV. Export a backup first if you want to keep it.',()=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===kind?{...section,entries:section.entries.filter(item=>item.id!==entry.id)}:section)})))}/>)}
 </SortableContext></DndContext>
 {!section.entries.length&&<div className="empty-state"><BriefcaseBusiness size={28}/><h3>Tell more of your story.</h3><p>Add your {names[kind].toLowerCase()} to get started.</p></div>}
 <Button variant="outline" className="add-entry" onPress={()=>update(cv=>({...cv,sections:cv.sections.map(section=>section.id===kind?{...section,entries:[...section.entries,emptyEntry()]}:section)}))}><Plus size={16}/>Add {kind==='summary'?'paragraph':kind==='skills'?'skill group':kind==='languages'?'language':'entry'}</Button>
 </>;
}
