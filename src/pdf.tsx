import {Document,Page,Text,View,Link,Font,Svg,Path,Circle,Image} from '@react-pdf/renderer';
import {names,linkFor,type CV,type Entry} from './model';
import {resolveFont} from './fonts';
import {faEnvelope,faGlobe,faLocationDot,faPhone} from '@fortawesome/free-solid-svg-icons';
import {faLinkedinIn} from '@fortawesome/free-brands-svg-icons';
Font.registerHyphenationCallback(word=>[word]);
const contactAssets:Record<string,string>={location:'/icons/location-pin-svgrepo-com.svg',email:'/icons/email-8-svgrepo-com.svg',phone:'/icons/phone-rounded-svgrepo-com.svg',website:'/icons/website-search-engine-svgrepo-com.svg',linkedin:'/icons/linkedin-svgrepo-com.svg'};
function ContactIcon({kind,color,style='outlined'}:{kind:string;color:string;style?:string}) {
 const definition={location:faLocationDot,email:faEnvelope,phone:faPhone,website:faGlobe,linkedin:faLinkedinIn}[kind as keyof typeof contactAssets];
 const path=definition?.icon[4];
 if(path)return <Svg width={12} height={12} viewBox={`0 0 ${definition.icon[0]} ${definition.icon[1]}`} style={{marginRight:5,marginTop:.5,flexShrink:0}}><Path d={Array.isArray(path)?path.join(' '):path} fill={color}/></Svg>;
 // Material-style variants keep the same crisp geometry; “filled” uses a heavier stroke
 // rather than flooding the outline paths, which preserves the small icon silhouettes.
 const filled=false; const strokeWidth=style==='filled'?2.1:style==='sharp'?2.4:style==='two-tone'?1.2:1.6;
 return <Svg width={12} height={12} viewBox="0 0 24 24" style={{marginRight:5,marginTop:.5,flexShrink:0}}>
  {kind==='location'?<><Path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/><Circle cx={12} cy={10} r={2.5} fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/></>:kind==='email'?<><Path d="M3 5h18v14H3Z M3 6l9 7 9-7" fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/></>:kind==='phone'?<Path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/>:kind==='linkedin'?<><Path d="M4 9v11 M4 4v1 M10 20V9h4v2c3-4 7-1 7 3v6 M14 11v9" fill={filled?color:"none"} stroke={color} strokeWidth={2}/></>:<><Circle cx={12} cy={12} r={9} fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/><Path d="M3 12h18 M12 3c5 5 5 13 0 18 M12 3c-5 5-5 13 0 18" fill={filled?color:"none"} stroke={color} strokeWidth={strokeWidth}/></>}
 </Svg>;
}
export function CVDocument({cv}:{cv:CV}){
 const {contact:c,settings:s}=cv;const modern=s.template==='modern';
 const body={fontSize:s.fontSize,lineHeight:s.spacing,color:'#303846',fontFamily:resolveFont(s.font),fontWeight:s.fontWeight,fontStyle:s.fontStyle};
 const heading={fontSize:s.fontSize+0.5,fontWeight:700 as const,fontStyle:'normal' as const,color:s.accent,letterSpacing:1.4,marginTop:11,marginBottom:6,borderBottomWidth:modern?0:0.6,borderBottomColor:'#dce0e6',paddingBottom:5};
 const entryBody=(e:Entry,kind:string)=>kind==='skills'||kind==='languages'?<Text key={e.id} style={{marginBottom:4}} orphans={2} widows={2}><Text style={{fontWeight:700}}>{e.title}</Text>{[e.subtitle,e.description].filter(Boolean).length?'  ·  ':''}{[e.subtitle,e.description].filter(Boolean).join(' · ')}</Text>:<View key={e.id} style={{marginBottom:8}}>
  {(e.title||e.start||e.end)&&<View minPresenceAhead={e.description?36:18} style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><Text style={{fontWeight:700,flex:1}}>{e.title}</Text>{(e.start||e.end)&&<Text style={{fontSize:s.fontSize-1,color:'#637080',maxWidth:'35%'}}>{[e.start,e.end].filter(Boolean).join(' – ')}</Text>}</View>}
  {(e.subtitle||e.location)&&<Text minPresenceAhead={e.description?24:0} style={{fontSize:s.fontSize-0.3,color:'#596372',marginTop:2}}>{[e.subtitle,e.location].filter(Boolean).join('  ·  ')}</Text>}
  {e.url&&linkFor(e.url)&&<Link src={linkFor(e.url)!} style={{fontSize:s.fontSize-1,color:s.accent,marginTop:3}}>{e.url.replace(/^https?:\/\//,'')}</Link>}
  {e.description.split('\n').filter(Boolean).map((line,i)=><Text key={i} orphans={2} widows={2} style={{marginTop:3}}>{kind==='experience'?'•  ':''}{line}</Text>)}
 </View>;
 return <Document title={`${c.name||'Untitled'} — CV`} author={c.name} subject="Curriculum vitae" language="en"><Page size={s.paper} wrap style={{...body,paddingTop:s.margin,paddingBottom:s.margin+12,paddingHorizontal:s.margin}}>
  <View style={{borderLeftWidth:modern?4:0,borderLeftColor:s.accent,paddingLeft:modern?16:0,marginBottom:5}}>
   <Text style={{fontSize:modern?31:29,fontWeight:700,fontStyle:'normal',color:modern?s.accent:'#192331',lineHeight:1.15}}>{c.name||'Your name'}</Text>
   {c.headline&&<Text style={{fontSize:13,color:s.accent,marginTop:6,marginBottom:6}}>{c.headline}</Text>}
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:5,fontSize:8.5,lineHeight:1.2,color:'#596372',marginTop:5}}>
    {(['location','email','phone','website','linkedin'] as const).filter(key=>c[key]).map((key,i)=>{const value=c[key];const url=key==='email'?`mailto:${value}`:key==='phone'?`tel:${value.replace(/\s/g,'')}`:key==='website'||key==='linkedin'?linkFor(value):undefined;return <View key={key} style={{flexDirection:'row',alignItems:'flex-start',marginRight:5}}>{s.showIcons?<ContactIcon kind={key} color={s.accent} style={s.iconStyle}/>:i>0&&<Text style={{marginRight:5,lineHeight:1.2}}>·</Text>}{url?<Link src={url} style={{color:'#596372',textDecoration:'none',lineHeight:1.2}}>{value.replace(/^https?:\/\//,'')}</Link>:<Text style={{lineHeight:1.2}}>{value}</Text>}</View>;})}
   </View>
  </View>
  {cv.sections.filter(section=>!section.hidden&&section.entries.some(e=>!e.hidden&&[e.title,e.subtitle,e.description].some(Boolean))).map(section=><View key={section.id}>
   <Text style={heading} minPresenceAhead={48}>{names[section.id].toUpperCase()}</Text>
   {section.entries.filter(e=>!e.hidden).map(e=>entryBody(e,section.id))}
  </View>)}
  {s.footerEnabled&&<>
   {s.footerNameEnabled&&<Text fixed style={{position:'absolute',bottom:24,left:s.margin,right:s.margin,fontSize:8,color:'#64748b',textAlign:!s.footerEmailEnabled&&!s.footerPageEnabled?s.footerPagePosition:'left'}}>{c.name}</Text>}
   {s.footerPageEnabled&&<Text fixed style={{position:'absolute',bottom:24,left:s.margin,right:s.margin,fontSize:8,color:'#0f2a4a',fontWeight:700,textAlign:s.footerNameEnabled||s.footerEmailEnabled?'center':s.footerPagePosition}} render={({pageNumber})=>String(pageNumber)}/>}
   {s.footerEmailEnabled&&<Text fixed style={{position:'absolute',bottom:24,left:s.margin,right:s.margin,fontSize:8,color:'#64748b',textAlign:!s.footerNameEnabled&&!s.footerPageEnabled?s.footerPagePosition:'right'}}>{c.email}</Text>}
  </>}
 </Page></Document>;
}


