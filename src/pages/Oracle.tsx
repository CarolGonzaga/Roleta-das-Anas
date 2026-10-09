import { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { tarotCards } from '../data/tarot';
import { wheelAngle } from '../services/game';
import type { OraclePhase, Spin } from '../types';
import { Wheel } from '../components/Wheel';
import { TarotImage } from '../components/TarotImage';
import { Reveal } from '../components/Reveal';

interface Props {
 spin:Spin|null; recovered:boolean; replay:boolean; reduced:boolean; busy:boolean; exhausted:boolean;
 onPhase:(phase:OraclePhase)=>void; onWin:()=>void; onHome:()=>void;
 onLeave:(page:'home'|'chest')=>void; onShare:()=>void; notice:string; error:string;
}
const descriptions: Record<OraclePhase,string> = {
 idle:'Minha gatinha, o destino preparou um carinho especial para você.',
 validating:'O grimório está reconhecendo seu encanto…',
 spinning:'O destino está tecendo sua surpresa…',
 'selecting-card':'Uma das nossas cartas escolheu você.',
 'moving-card':'Seu encanto está se aproximando…',
 'flipping-card':'Um carinho guardado só para você.',
 'revealing-reward':'O destino trouxe um mimo para minha gatinha!',
 completed:'Seu encanto foi revelado.',
};
export function Oracle(props:Props) {
 const {spin,recovered,replay,reduced,busy,exhausted,onPhase,onWin,onHome,onLeave,onShare,notice,error}=props;
 const [phase,setPhase]=useState<OraclePhase>(spin?(recovered?'completed':'spinning'):'idle');
 const [angle,setAngle]=useState(0);
 const card=spin?.cardSnapshot;
 const winner=card?.id;
 const finished=phase==='revealing-reward'||phase==='completed';
 const moving=phase==='moving-card'||phase==='flipping-card';
 useEffect(()=>{if(card){const image=new Image();image.src=card.image;}},[card]);
 useEffect(()=>{if(reduced&&['selecting-card','moving-card','flipping-card'].includes(phase))setPhase('revealing-reward');},[phase,reduced]);
 useEffect(()=>{onPhase(phase);},[phase,onPhase]);
 useEffect(()=>{
  if(phase==='spinning'&&card){
   let second=0;
   const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setAngle(wheelAngle(tarotCards.findIndex(c=>c.id===card.id),4)));});
   return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
  }
 },[phase,card]);
 useEffect(()=>{
  // Eventos visuais conduzem o fluxo; os limites recuperam eventos suspensos.
  const delays:Partial<Record<OraclePhase,number>>={spinning:reduced?300:7500,'selecting-card':550,'moving-card':1400,'flipping-card':1400,'revealing-reward':700};
  const next:Partial<Record<OraclePhase,OraclePhase>>={spinning:reduced?'revealing-reward':'selecting-card','selecting-card':'moving-card','moving-card':'flipping-card','flipping-card':'revealing-reward','revealing-reward':'completed'};
  if(delays[phase]===undefined)return;
  const timer=setTimeout(()=>setPhase(next[phase]!),delays[phase]);
  return()=>clearTimeout(timer);
 },[phase,reduced]);
 useEffect(()=>{if(phase==='revealing-reward')onWin();},[phase,onWin]);
 return <LayoutGroup id={'oracle-'+(spin?.id??'idle')}><section className="oracle-page" data-phase={phase} aria-busy={!['idle','completed'].includes(phase)}>
  {!finished&&<><div className="page-heading"><span className="eyebrow">QUATRO CARTAS. TODO O MEU AMOR.</span><h1>O Oráculo dos <em>Encantos</em></h1><p role="status">{descriptions[phase]}</p></div>
   <div className={'tarot-stage '+(moving?'card-in-flight':'')}>
    <div className="stage-circle" aria-hidden="true"/>
    {tarotCards.map((c,i)=>{
     const selected=winner===c.id&&phase!=='spinning';
     return <div className={'tarot-slot slot-'+i+(selected?' chosen':'')+(winner&&phase!=='spinning'&&!selected?' dimmed':'')} key={c.id}>
      {!(moving&&winner===c.id)&&<motion.div className="stage-card" layoutId={spin&&winner===c.id?'oracle-card-'+spin.id+'-'+c.id:undefined} transition={{duration:.9,ease:[.22,1,.36,1]}}><TarotImage back/></motion.div>}
     </div>;
    })}
    <div className="stage-wheel"><Wheel angle={angle} spinning={phase==='spinning'} reduced={reduced} winner={phase==='spinning'?undefined:winner} onStopped={()=>setPhase(current=>current==='spinning'?(reduced?'revealing-reward':'selecting-card'):current)}/></div>
    {moving&&spin&&card&&<motion.div className="flying-card" layoutId={'oracle-card-'+spin.id+'-'+card.id} transition={{duration:.9,ease:[.22,1,.36,1]}} onLayoutAnimationComplete={()=>setPhase(current=>current==='moving-card'?'flipping-card':current)}>
     <div className={'card-flipper '+(phase==='flipping-card'?'is-flipped':'')} onTransitionEnd={e=>{if(e.target===e.currentTarget&&e.propertyName==='transform')setPhase(current=>current==='flipping-card'?'revealing-reward':current);}}>
      <div className="card-side card-reverse"><TarotImage back/></div><div className="card-side card-front" aria-hidden="true"><TarotImage card={card}/></div>
     </div>
    </motion.div>}
   </div>
   <div className="oracle-actions">{phase==='idle'?<>{exhausted?<><Sparkles size={25}/><h2>Cada encanto encontrou seu lugar.</h2><p>Seu baú guarda todos os mimos desta coleção. Novos códigos ficam guardados, sem serem consumidos.</p></>:<><p className="locked-note"><KeyRound size={16}/>Seu código abre um destino cheio de carinho.</p><button className="primary" onClick={onHome}>Inserir meu código <ArrowRight size={17}/></button></>}<p className="small-note">O mimo é surpresa. Cada prêmio tem seu único momento.</p></>:<p className="small-note" role="status">{descriptions[phase]}</p>}{error&&<p className="feedback error" role="alert">{error}</p>}</div>
  </>}
  {finished&&spin&&<Reveal spin={spin} busy={busy||phase!=='completed'} replay={replay} reduced={reduced} onLeave={onLeave} onShare={onShare} notice={notice} error={error}/>}
 </section></LayoutGroup>;
}
