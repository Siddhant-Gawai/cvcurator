import {Checkbox,ColorField,Input,Label,Slider,Switch,ToggleButton} from '@heroui/react';
import {AlignLeft,Bold,Check,FileText,Italic,LayoutTemplate,Palette,Ruler,Type,UnfoldVertical,MapPin} from 'lucide-react';
import {fontFamilies,resolveFont,serifFonts} from './fonts';
import {useCV} from './store';
import type {CV} from './model';
import {SelectField} from './components/ui/select';

export function Design() {
 const settings=useCV(state=>state.cv.settings); const contact=useCV(state=>state.cv.contact); const footerSelectionCount=Number(settings.footerNameEnabled)+Number(settings.footerEmailEnabled)+Number(settings.footerPageEnabled); const footerAlignmentTarget=settings.footerPageEnabled?'Page number':settings.footerNameEnabled?'Name':'Email';
 const update=useCV(state=>state.update);
 const set=<K extends keyof CV['settings']>(key:K,value:CV['settings'][K])=>update(cv=>({...cv,settings:{...cv.settings,[key]:value}}));
 return <div className="design-form">
  <div className="setting-heading"><h3><LayoutTemplate size={16}/>Template</h3><p>Choose the layout that feels like you.</p></div>
  <div className="template-options">{(['classic','modern'] as const).map(template=><ToggleButton key={template} className="template-option" isSelected={settings.template===template} onChange={()=>set('template',template)} aria-label={`${template==='classic'?'Essential':'Modern'} template`}>
   <div className={`mini-paper ${template}`}><b/><i/><hr/><span/><span/><span/><hr/><span/><span/><hr/><span/><span/></div><div><strong>{template==='classic'?'Essential':'Modern'}</strong>{settings.template===template&&<Check size={16}/>}</div><small>{template==='classic'?'Clean & timeless':'Fresh & confident'}</small>
  </ToggleButton>)}</div>
  <div className="design-block"><h3><Type size={16}/>Typography</h3>
   <SelectField label="Font family" value={resolveFont(settings.font)} onChange={font=>set('font',font as CV['settings']['font'])} icon={<Type size={18}/>} options={fontFamilies.map(font=>({id:font,label:font,font,description:serifFonts.has(font)?'Serif':'Sans serif'}))}/>
   <div className="font-specimen" style={{fontFamily:resolveFont(settings.font),fontWeight:settings.fontWeight,fontStyle:settings.fontStyle}}><span>Aa</span><p>Your next chapter starts here.</p><small>24 fonts · Included on your device</small></div>
   <SelectField label="Body text style" value={`${settings.fontWeight}-${settings.fontStyle}`} onChange={value=>{const [weight,style]=value.split('-');update(cv=>({...cv,settings:{...cv.settings,fontWeight:Number(weight) as 400|700,fontStyle:style as 'normal'|'italic'}}));}} icon={<AlignLeft size={17}/>} options={[
    {id:'400-normal',label:'Regular',icon:<Type size={16}/>},{id:'700-normal',label:'Bold',icon:<Bold size={16}/>},{id:'400-italic',label:'Italic',icon:<Italic size={16}/>},{id:'700-italic',label:'Bold italic',icon:<span className="font-bold italic text-base">Bi</span>},
   ]}/>
  </div>
  <div className="design-block"><h3><Palette size={16}/>Accent colour</h3>
   <div className="swatches">{['#4f46e5','#1e293b','#0f766e','#2563eb','#9f1239','#92400e'].map(color=><ToggleButton isIconOnly key={color} style={{background:color}} isSelected={settings.accent===color} aria-label={`Accent ${color}`} onChange={()=>set('accent',color)}>{settings.accent===color&&<Check size={17}/>}</ToggleButton>)}</div>
   <ColorField className="custom-colour-field" value={settings.accent} onChange={color=>{if(color)set('accent',color.toString('hex'));}}><Label>Custom hex colour</Label><Input/></ColorField>
  </div>
  <div className="design-block colors-panel"><h3><Palette size={16}/>Colors</h3><p className="design-help">Choose where your accent color appears throughout the CV.</p><div className="color-layouts">{['Full page','Header','Border'].map((label,i)=><ToggleButton key={label} className={`color-layout color-layout-${i}`} isSelected={i===1} onChange={()=>{}}><span/><small>{label}</small></ToggleButton>)}</div><div className="color-presets">{['#1e3a5f','#245b73','#3d7c8a','#73545d','#7b2e62','#4f46e5','#9b6a3d','#2f4858'].map(color=><ToggleButton key={color} className="color-preset" style={{background:color}} isSelected={settings.accent===color} aria-label={`Use ${color}`} onChange={()=>set('accent',color)}><i/><i/></ToggleButton>)}</div><div className="accent-targets"><strong>Apply Accent Color</strong>{[['headings','Headings'],['headingLine','Headings line'],['headerIcons','Header icons'],['linkIcons','Link icons'],['dots','Dots / bars / bubbles'],['dates','Dates'],['entryTitle','Entry title'],['entrySubtitle','Entry subtitle']].map(([id,label])=><Checkbox key={id} isSelected={settings.accentTargets.includes(id as CV['settings']['accentTargets'][number])} onChange={checked=>update(cv=>({...cv,settings:{...cv.settings,accentTargets:checked?[...cv.settings.accentTargets,id as CV['settings']['accentTargets'][number]]:cv.settings.accentTargets.filter(item=>item!==id)}}))}>{label}</Checkbox>)}</div></div>
  <div className="design-block"><h3><FileText size={16}/>Page setup</h3>
   <SelectField label="Paper size" value={settings.paper} onChange={value=>set('paper',value as 'A4'|'LETTER')} icon={<FileText size={17}/>} options={[{id:'A4',label:'A4',description:'210 × 297 mm',icon:<FileText size={17}/>},{id:'LETTER',label:'US Letter',description:'8.5 × 11 inches',icon:<FileText size={17}/>} ]}/>
   {[
    {key:'fontSize',label:'Font size',min:9,max:13,step:.5,unit:'pt',Icon:Type},
    {key:'spacing',label:'Line spacing',min:1,max:1.7,step:.05,unit:'×',Icon:UnfoldVertical},
    {key:'margin',label:'Page margins',min:28,max:64,step:2,unit:'pt',Icon:Ruler},
   ].map(({key,label,min,max,step,unit,Icon})=><Slider key={key} className="setting-slider" minValue={min} maxValue={max} step={step} value={settings[key as 'fontSize'|'spacing'|'margin']} onChange={value=>set(key as 'fontSize'|'spacing'|'margin',Number(value))}>
    <div className="slider-label"><Label><Icon size={15}/>{label}</Label><Slider.Output>{settings[key as 'fontSize'|'spacing'|'margin']}{unit}</Slider.Output></div><Slider.Track><Slider.Fill/><Slider.Thumb/></Slider.Track>
   </Slider>)}
  </div>
  <div className="design-block footer-setting"><h3><FileText size={16}/>Footer</h3><p className="design-help">Add a consistent footer to every page of your CV.</p><Switch aria-label="Show CV footer" isSelected={settings.footerEnabled} onChange={value=>set('footerEnabled',value)}><Switch.Content><Switch.Control><Switch.Thumb/></Switch.Control></Switch.Content></Switch>{settings.footerEnabled&&<div className="footer-fields"><label className="footer-check"><input type="checkbox" checked={settings.footerNameEnabled} onChange={e=>set('footerNameEnabled',e.target.checked)}/><span className="footer-value">{contact.name||'Your name'}</span></label><label className="footer-check"><input type="checkbox" checked={settings.footerEmailEnabled} onChange={e=>set('footerEmailEnabled',e.target.checked)}/><span className="footer-value">{contact.email||'Your email'}</span></label><label className="footer-check"><input type="checkbox" checked={settings.footerPageEnabled} onChange={e=>set('footerPageEnabled',e.target.checked)}/><span>Page number</span></label>{settings.footerPageEnabled&&(settings.footerNameEnabled||settings.footerEmailEnabled)&&<SelectField label="Page number position" value={settings.footerPagePosition} onChange={value=>set('footerPagePosition',value as CV['settings']['footerPagePosition'])} options={['left','center','right'].map(position=>({id:position,label:position[0].toUpperCase()+position.slice(1)}))}/>}<div className="footer-alignment"><strong>{footerAlignmentTarget} alignment</strong><div className="footer-alignment-options">{(['left','center','right'] as const).map(position=><ToggleButton key={position} className="footer-align-option" isDisabled={footerSelectionCount!==1} isSelected={settings.footerPagePosition===position} onChange={()=>set('footerPagePosition',position)} aria-label={`Align ${footerAlignmentTarget.toLowerCase()} ${position}`}><span className={`align-glyph align-${position}`}><i/><i/></span></ToggleButton>)}</div></div><p>Name and email use your contact details automatically.</p></div>}</div>
  <div className="design-block icon-setting"><div><h3>Contact icons</h3><p>Add small icons beside your contact details.</p></div><Switch aria-label="Show contact icons in CV" isSelected={settings.showIcons} onChange={value=>set('showIcons',value)}><Switch.Content aria-label="Show contact icons in CV"><Switch.Control><Switch.Thumb/></Switch.Control></Switch.Content></Switch></div>
  {settings.showIcons&&<SelectField label="Icon style" value={settings.iconStyle} onChange={value=>set('iconStyle',value as CV['settings']['iconStyle'])} icon={<MapPin size={17}/>} options={(['outlined','filled','rounded','sharp','two-tone'] as const).map(style=>({id:style,label:style==='two-tone'?'Two-tone':style[0].toUpperCase()+style.slice(1),description:'Google Material Symbols style',icon:<MapPin size={17} fill={style==='filled'?'currentColor':'none'} strokeWidth={style==='sharp'?2.5:1.8}/>}))}/>} 
 </div>;
}








