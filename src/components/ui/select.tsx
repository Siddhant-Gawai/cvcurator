import {Description,Label,ListBox,Select} from '@heroui/react';
import type {ReactNode} from 'react';
export type SelectOption={id:string;label:string;description?:string;icon?:ReactNode;font?:string};
export function SelectField({label,value,onChange,options,icon,placeholder='Choose an option',isDisabled=false}:{label:string;value:string|null;onChange:(value:string)=>void;options:SelectOption[];icon?:ReactNode;placeholder?:string;isDisabled?:boolean}) {
 const selected=options.find(option=>option.id===value);
 const leadingIcon=selected?.icon??icon;
 return <Select className="folio-select" value={value} onChange={key=>{if(key!==null)onChange(String(key));}} placeholder={placeholder} isDisabled={isDisabled}>
  <Label>{label}</Label>
  <Select.Trigger>{leadingIcon&&<span className="select-leading-icon" aria-hidden="true">{leadingIcon}</span>}<Select.Value>{selected?<span style={selected.font?{fontFamily:selected.font}:undefined}>{selected.label}</span>:placeholder}</Select.Value><Select.Indicator/></Select.Trigger>
  <Select.Popover className="folio-select-popover"><ListBox aria-label={label} items={options}>
   {option=><ListBox.Item id={option.id} textValue={option.label} className="folio-option">{(option.icon??icon)&&<span className="option-icon" aria-hidden="true">{option.icon??icon}</span>}<div className="option-copy"><Label style={option.font?{fontFamily:option.font}:undefined}>{option.label}</Label>{option.description&&<Description>{option.description}</Description>}</div><ListBox.ItemIndicator/></ListBox.Item>}
  </ListBox></Select.Popover>
 </Select>;
}
