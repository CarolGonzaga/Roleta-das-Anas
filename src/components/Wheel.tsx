import { Infinity as InfinityIcon, Moon, Scale, Sparkles, Sun } from 'lucide-react';
import { tarotCards } from '../data/tarot';
import type { CardId } from '../types';
const symbols = {Sun,Moon,Infinity:InfinityIcon,Scale};
const colors = ['#233b4d','#18263e','#314044','#263048'];
interface Props { angle:number; spinning:boolean; reduced:boolean; winner?:CardId; onStopped?:()=>void }
export function Wheel({angle,spinning,reduced,winner,onStopped}:Props) {
 function point(degrees:number,radius:number) { const a=(degrees-90)*Math.PI/180; return `${200+Math.cos(a)*radius},${200+Math.sin(a)*radius}`; }
 return <div className={`wheel-shell oracle-wheel ${spinning?'is-spinning':''}`} aria-label="Roleta com quatro cartas: O Sol, A Lua, A Força e A Justiça">
  <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
  <Sparkles className="orbit-spark spark-one" size={23}/><Sparkles className="orbit-spark spark-two" size={18}/>
  <div className="wheel-pointer" aria-hidden="true"/>
  <div className="wheel-rotor" style={{transform:`rotate(${angle}deg)`,transition:spinning?`transform ${reduced?'.25':'6'}s cubic-bezier(.3,0,.12,1)`:'none'}} onTransitionEnd={e=>{if(e.target===e.currentTarget&&e.propertyName==='transform')onStopped?.();}}>
   <svg viewBox="0 0 400 400" aria-hidden="true" className="wheel-segments">
    {tarotCards.map((c,i)=><path key={c.id} d={`M200,200 L${point(i*90,194)} A194,194 0 0,1 ${point((i+1)*90,194)} Z`} fill={winner===c.id?'#846c3c':colors[i]} stroke="#d9b977" strokeOpacity=".5" strokeWidth="1"/>)}
    <circle cx="200" cy="200" r="183" fill="none" stroke="#d9b977" strokeOpacity=".5" strokeDasharray="1 9"/>
   </svg>
   {tarotCards.map((c,i)=>{const Symbol=symbols[c.icon];return <div key={c.id} className="wheel-label oracle-symbol" style={{transform:`rotate(${(i+.5)*90}deg) translateY(calc(var(--wheel-size) * -.315)) rotate(-${(i+.5)*90}deg)`}}><Symbol size={30}/><span>{c.name}</span></div>;})}
  </div>
  <div className="wheel-center" aria-hidden="true"><Moon size={35} strokeWidth={1.2}/><span>o oráculo</span></div>
 </div>;
}
