import { Moon, Sparkles } from 'lucide-react';
import type { Reward } from '../types';
import { PrizeIcon } from './Icon';
const colors=['#573669','#82516f','#514268','#76578b','#60446e','#8b597a','#58406c','#795987','#5a3972'];
export function Wheel({pool,angle,spinning,reduced,winner}:{pool:Reward[];angle:number;spinning:boolean;reduced:boolean;winner?:number}) {
 const count=pool.length, step=360/count;
 function point(deg:number,r:number) {const a=(deg-90)*Math.PI/180;return `${200+Math.cos(a)*r},${200+Math.sin(a)*r}`;}
 return <div className={`wheel-shell ${spinning?'is-spinning':''}`}>
  <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
  <Sparkles className="orbit-spark spark-one" size={23}/><Sparkles className="orbit-spark spark-two" size={18}/>
  <div className="wheel-pointer" aria-hidden="true"/>
  <div className="wheel-rotor" style={{transform:`rotate(${angle}deg)`,transition:spinning?`transform ${reduced?'.25':'6'}s cubic-bezier(.12,.65,.12,1)`:'none'}}>
   <svg viewBox="0 0 400 400" aria-hidden="true" className="wheel-segments">
    {pool.map((r,i)=><path key={r.id} d={`M200,200 L${point(i*step,194)} A194,194 0 ${step>180?1:0},1 ${point((i+1)*step,194)} Z`} fill={winner===r.id?'#ab7a82':colors[i%colors.length]} stroke="#d9b977" strokeOpacity=".4" strokeWidth="1"/>)}
    <circle cx="200" cy="200" r="185" fill="none" stroke="#d9b977" strokeOpacity=".38" strokeDasharray="1 9"/>
   </svg>
   {pool.map((r,i)=>{const degrees=(i+.5)*step;return <div key={r.id} className="wheel-label" style={{transform:`rotate(${degrees}deg) translateY(calc(var(--wheel-size) * -.325)) rotate(90deg)`}}><PrizeIcon name={r.icon} size={20}/><span>{r.shortName}</span></div>;})}
  </div>
  <div className="wheel-center" aria-hidden="true"><Moon size={35} strokeWidth={1.2}/><span>feito de amor</span></div>
 </div>;
}
