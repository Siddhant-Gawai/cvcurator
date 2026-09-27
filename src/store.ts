import {create} from 'zustand';
import {persist,createJSONStorage} from 'zustand/middleware';
import {cvSchema,exampleCV,type CV} from './model';
export const STORAGE_KEY='folio-cv-v1';
let storageError='';
export const storageStatus=()=>storageError;
const storage={getItem:(key:string)=>{try{return localStorage.getItem(key);}catch{storageError='Local saving is unavailable. Export a backup to keep your work.';return null;}},setItem:(key:string,value:string)=>{try{localStorage.setItem(key,value);storageError='';}catch{storageError='Could not save to this device. Export a backup to keep your work.';}},removeItem:(key:string)=>{try{localStorage.removeItem(key);}catch{}}};
type Store={cv:CV;revision:number;update:(fn:(cv:CV)=>CV)=>void;replace:(cv:CV)=>void};
export const useCV=create<Store>()(persist((set)=>({cv:exampleCV(),revision:0,update:fn=>set(s=>({cv:fn(s.cv)})),replace:cv=>set(s=>({cv,revision:s.revision+1}))}),{name:STORAGE_KEY,version:2,storage:createJSONStorage(()=>storage),partialize:s=>({cv:s.cv}),migrate:(state)=>{const parsed=cvSchema.safeParse((state as {cv?:unknown})?.cv);return {cv:parsed.success?parsed.data:exampleCV()};},merge:(persisted,current)=>{const parsed=cvSchema.safeParse((persisted as {cv?:unknown})?.cv);return {...current,cv:parsed.success?parsed.data:current.cv};}}));

