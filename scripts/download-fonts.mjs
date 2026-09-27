import { mkdir, writeFile } from 'node:fs/promises';

const families = ['Inter','Roboto','Open Sans','Lato','Montserrat','Source Sans 3','Nunito Sans','Work Sans','DM Sans','Rubik','Ubuntu','Merriweather','Lora','Libre Baskerville','Source Serif 4','PT Serif','PT Sans','Crimson Pro','EB Garamond','Playfair Display','Fira Sans','IBM Plex Sans','IBM Plex Serif','Noto Sans'];
const root = new URL('../public/fonts/', import.meta.url);
const get = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': 'FolioFontBundler/1.0' }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
};
await mkdir(root, { recursive: true });
const manifest = [];
for (let offset = 0; offset < families.length; offset += 4) {
  await Promise.all(families.slice(offset, offset + 4).map(async family => {
    const id = family.toLowerCase().replaceAll(' ', '-');
    const css = await (await get(`https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:400,400i,700,700i`)).text();
    const blocks = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)];
    const variants = await Promise.all(blocks.map(async ([, block]) => {
      const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
      const style = block.match(/font-style:\s*(\w+)/)?.[1];
      const source = block.match(/url\(([^)]+)\)/)?.[1];
      if (!source || !['normal', 'italic'].includes(style) || ![400, 700].includes(weight)) throw new Error(`Invalid font metadata: ${family}`);
      const file = `${id}-${weight}-${style}.ttf`;
      const bytes = new Uint8Array(await (await get(source)).arrayBuffer());
      if (bytes.length < 1000) throw new Error(`Invalid font file: ${file}`);
      await writeFile(new URL(file, root), bytes);
      return { weight, style, file, source };
    }));
    if (variants.length !== 4) throw new Error(`${family}: expected all four styles`);
    const licensePath = family === 'Ubuntu' ? 'ufl/ubuntu/UFL.txt' : `ofl/${family.toLowerCase().replaceAll(' ', '')}/OFL.txt`;
    const license = await (await get(`https://raw.githubusercontent.com/google/fonts/main/${licensePath}`)).text();
    await writeFile(new URL(`${id}-LICENSE.txt`, root), license);
    manifest.push({ family, id, variants });
    console.log(`${family}: regular, bold, italic, bold italic downloaded`);
  }));
}
manifest.sort((a,b) => families.indexOf(a.family) - families.indexOf(b.family));
await writeFile(new URL('manifest.json', root), JSON.stringify(manifest, null, 2));
const css = manifest.flatMap(font => font.variants.map(v => `@font-face{font-family:'${font.family}';font-weight:${v.weight};font-style:${v.style};font-display:swap;src:url('/fonts/${v.file}') format('truetype');}`)).join('\n');
await writeFile(new URL('fonts.css', root), css);
console.log(`Bundled ${manifest.length} families and ${manifest.length * 4} font files.`);
