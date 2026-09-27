import { z } from 'zod';
import { fontFamilies } from './fonts';

export const kinds = ['summary','experience','education','projects','skills','certifications','languages'] as const;
export const names: Record<string,string> = { contact:'Personal details', summary:'Profile', experience:'Experience', education:'Education', projects:'Projects', skills:'Skills', certifications:'Certifications', languages:'Languages' };
const text = z.string().max(12000);
export const entrySchema = z.object({ id:z.string().min(1), hidden:z.boolean(), title:text, subtitle:text, location:text, start:text, end:text, description:text, url:text });
export const contactSchema = z.object({name:text, headline:text, email:text, phone:text, location:text, website:text, linkedin:text});
export const settingsSchema = z.object({template:z.enum(['classic','modern']), accent:z.string().regex(/^#[0-9a-fA-F]{6}$/), accentTargets:z.array(z.enum(['headings','headingLine','headerIcons','linkIcons','dates','dots','entryTitle','entrySubtitle'])).default(['headings','headingLine','headerIcons','linkIcons','dates','dots']), font:z.enum([...fontFamilies,'Helvetica','Times-Roman','NotoSans']), fontWeight:z.union([z.literal(400),z.literal(700)]).default(400), fontStyle:z.enum(['normal','italic']).default('normal'), showIcons:z.boolean().default(true), iconStyle:z.enum(['outlined','filled','rounded','sharp','two-tone']).default('outlined'), fontSize:z.number().min(9).max(13), spacing:z.number().min(1).max(1.7), margin:z.number().min(28).max(64), paper:z.enum(['A4','LETTER']),footerEnabled:z.boolean().default(false),footerNameEnabled:z.boolean().default(true),footerEmailEnabled:z.boolean().default(true),footerPageEnabled:z.boolean().default(true),footerPagePosition:z.enum(['left','center','right']).default('center'),footerName:z.string().default(''),footerEmail:z.string().default('')});
export const cvSchema = z.object({contact:contactSchema, sections:z.array(z.object({id:z.enum(kinds),hidden:z.boolean(),entries:z.array(entrySchema).max(150)})).max(7),settings:settingsSchema}).superRefine((data,ctx)=>{const ids=data.sections.map(s=>s.id); if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Duplicate sections'}); const entries=data.sections.flatMap(s=>s.entries.map(e=>e.id)); if(new Set(entries).size!==entries.length)ctx.addIssue({code:'custom',message:'Duplicate entries'});});
export const backupSchema = z.object({version:z.literal(1),cv:cvSchema});
export type Entry=z.infer<typeof entrySchema>;
export type CV=z.infer<typeof cvSchema>;
export type Kind=typeof kinds[number];
export type Contact=CV['contact'];
export const emptyEntry=():Entry=>({id:crypto.randomUUID(),hidden:false,title:'',subtitle:'',location:'',start:'',end:'',description:'',url:''});
const entry=(id:string,title:string,subtitle='',description='',start='',end='',location='',url=''):Entry=>({id,title,subtitle,description,start,end,location,url,hidden:false});
export const defaults:CV['settings']={template:'classic',accent:'#4f46e5',accentTargets:['headings','headingLine','headerIcons','linkIcons','dates','dots'],footerEnabled:false,footerNameEnabled:true,footerEmailEnabled:true,footerPageEnabled:true,footerPagePosition:'center',footerName:'',footerEmail:'',font:'Inter',fontWeight:400,fontStyle:'normal',showIcons:true,iconStyle:'outlined',fontSize:10,spacing:1.4,margin:42,paper:'A4'};
export function exampleCV():CV{return {contact:{name:'Alex Morgan',headline:'Product Designer',email:'alex.morgan@example.com',phone:'+44 7700 900123',location:'London, United Kingdom',website:'https://example.com',linkedin:'https://linkedin.com/in/example'},settings:{...defaults},sections:[
{id:'summary',hidden:false,entries:[entry('profile','', '', 'Curious product designer who turns complex problems into thoughtful, accessible experiences. Combining a foundation in visual communication with hands-on research and a love of making things that work beautifully.')]},
{id:'experience',hidden:false,entries:[entry('exp-1','Product Design Intern','Studio North','Partnered with a cross-functional team to improve the onboarding experience for a personal finance app.\nDesigned and tested interactive prototypes with 12 users, helping reduce onboarding drop-off by 18%.\nCreated reusable components and documented accessible interaction patterns.', 'Jun 2025','Present','London, UK')]},
{id:'education',hidden:false,entries:[entry('edu-1','BA (Hons) Design','University of the Arts London','First-class honours · Focus on interaction design and digital experiences.', '2022','2025','London, UK')]},
{id:'projects',hidden:false,entries:[entry('project-1','Neighbourhood','Community discovery app','Designed a mobile experience that helps people discover independent local businesses. Led research, interaction design and usability testing from concept to prototype.','2025','','','https://example.com/neighbourhood')]},
{id:'skills',hidden:false,entries:[entry('skill-1','Design','', 'User research, Interaction design, Wireframing, Prototyping, Design systems'),entry('skill-2','Tools','', 'Figma, FigJam, Adobe Illustrator, HTML & CSS')]},
{id:'certifications',hidden:false,entries:[entry('cert-1','Google UX Design Certificate','Google / Coursera','','2024')]},
{id:'languages',hidden:false,entries:[entry('lang-1','English','Native'),entry('lang-2','French','Conversational')]}
]};}
export function blankCV():CV{return {contact:{name:'',headline:'',email:'',phone:'',location:'',website:'',linkedin:''},settings:{...defaults},sections:kinds.map(id=>({id,hidden:false,entries:[]}))};}
export function move<T>(items:T[],from:number,to:number):T[]{if(from<0||to<0||from>=items.length||to>=items.length)return items; const result=[...items];result.splice(to,0,result.splice(from,1)[0]);return result;}
export function parseBackup(raw:string):CV {return backupSchema.parse(JSON.parse(raw)).cv;}
export const serializeBackup=(cv:CV)=>JSON.stringify({version:1,cv},null,2);
export function linkFor(value:string):string|undefined{if(!value.trim())return; try{const url=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`);return ['https:','http:'].includes(url.protocol)&&url.hostname.includes('.')?url.href:undefined;}catch{return;}}
export const contactValidation=contactSchema.extend({email:z.union([z.literal(''),z.email('Enter a valid email address.')]),website:z.string().refine(v=>!v||!!linkFor(v),'Enter a website address, such as example.com.'),linkedin:z.string().refine(v=>!v||!!linkFor(v),'Enter a valid profile address.')});



