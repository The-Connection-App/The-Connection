import React, { useEffect, useState } from 'react';

const vars = [
  '--background','--foreground','--muted','--muted-foreground',
  '--popover','--popover-foreground','--card','--card-foreground',
  '--border','--input','--primary','--primary-foreground',
  '--secondary','--secondary-foreground','--accent','--accent-foreground',
  '--destructive','--destructive-foreground','--ring'
];

function hslToHex(hsl: string): string {
  const parts = hsl.split(/\s+/);
  if (parts.length !== 3) return hsl;
  const h = Number(parts[0]);
  const s = Number(parts[1].replace('%',''))/100;
  const l = Number(parts[2].replace('%',''))/100;

  // convert
  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${[v,v,v].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()}`;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p:number, q:number, t:number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(hue2rgb(p,q,(h/360) + 1/3) * 255);
  const g = Math.round(hue2rgb(p,q,(h/360)) * 255);
  const b = Math.round(hue2rgb(p,q,(h/360) - 1/3) * 255);
  return `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()}`;
}

export default function ThemeDebugOverlay() {
  const [values, setValues] = useState<Record<string,string>>({});
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const read = () => {
      const root = getComputedStyle(document.documentElement);
      const map: Record<string,string> = {};
      vars.forEach(v => {
        const val = root.getPropertyValue(v).trim();
        if (!val) return;
        let hex = val;
        try { hex = hslToHex(val); } catch (e) {}
        map[v] = `${val} → ${hex}`;
      });
      setValues(map);
      setIsDark(document.documentElement.classList.contains('dark') || window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    };

    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', read);
    return () => {
      obs.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{position:'fixed', right:8, bottom:8, zIndex:9999, background:'rgba(0,0,0,0.6)', color:'white', padding:8, borderRadius:8, fontSize:12, maxWidth:320}}>
      <div style={{fontWeight:600, marginBottom:6}}>Theme Debug ({isDark ? 'dark' : 'light'})</div>
      <div style={{maxHeight:260, overflow:'auto'}}>
        {Object.keys(values).map(k => (
          <div key={k} style={{marginBottom:4}}><code style={{opacity:0.9}}>{k}</code>: <span style={{float:'right'}}>{values[k]}</span></div>
        ))}
      </div>
      <div style={{marginTop:8, fontSize:11, opacity:0.8}}>Dev-only overlay — removes in production.</div>
    </div>
  );
}
