import {Font} from '@react-pdf/renderer';
export const fontFamilies = ['Inter','Roboto','Open Sans','Lato','Montserrat','Source Sans 3','Nunito Sans','Work Sans','DM Sans','Rubik','Ubuntu','Merriweather','Lora','Libre Baskerville','Source Serif 4','PT Serif','PT Sans','Crimson Pro','EB Garamond','Playfair Display','Fira Sans','IBM Plex Sans','IBM Plex Serif','Noto Sans'] as const;
export type FontFamily = typeof fontFamilies[number];
export const serifFonts = new Set<string>(['Merriweather','Lora','Libre Baskerville','Source Serif 4','PT Serif','Crimson Pro','EB Garamond','Playfair Display','IBM Plex Serif']);
export function resolveFont(font:string):FontFamily {
 if(font==='Times-Roman')return 'Source Serif 4';
 if(font==='NotoSans')return 'Noto Sans';
 return fontFamilies.includes(font as FontFamily)?font as FontFamily:'Inter';
}
for(const family of fontFamilies) {
 const id=family.toLowerCase().replaceAll(' ','-');
 Font.register({family,fonts:[
  {src:`${import.meta.env.BASE_URL}fonts/${id}-400-normal.ttf`,fontWeight:400,fontStyle:'normal'},
  {src:`${import.meta.env.BASE_URL}fonts/${id}-700-normal.ttf`,fontWeight:700,fontStyle:'normal'},
  {src:`${import.meta.env.BASE_URL}fonts/${id}-400-italic.ttf`,fontWeight:400,fontStyle:'italic'},
  {src:`${import.meta.env.BASE_URL}fonts/${id}-700-italic.ttf`,fontWeight:700,fontStyle:'italic'},
 ]});
}
