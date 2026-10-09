import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Gift, Heart, Share2, Sparkles } from 'lucide-react';
import type { Spin } from '../types';
import { PrizeIcon } from './Icon';
import { TarotImage } from './TarotImage';
import { formatDate } from '../pages/Chest';

interface Props { spin:Spin; busy:boolean; replay:boolean; reduced:boolean; onLeave:(page:'home'|'chest')=>void; onShare:()=>void; notice:string; error:string }
export function Reveal({spin,busy,replay,reduced,onLeave,onShare,notice,error}:Props) {
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});},[]);
 const card=spin.cardSnapshot;
 return <section className="oracle-result">
  <div className="revealed-art">
   <motion.div className="large-tarot" layoutId={reduced?undefined:'oracle-card-'+spin.id+'-'+card?.id} transition={{duration:reduced?0:.7,ease:[.22,1,.36,1]}}><TarotImage card={card}/></motion.div>
   <div className="art-caption"><span className="eyebrow">{card?.english??'GRIMÓRIO ORIGINAL'}</span><span>{card?.person??'Uma memória nossa'}</span></div>
  </div>
  <motion.div className="result-copy" initial={{opacity:0,y:reduced?0:16}} animate={{opacity:1,y:0}} transition={{duration:reduced?.2:.7,delay:reduced?0:.25}}>
   <span className="eyebrow"><Sparkles size={15}/>{replay?'UMA MEMÓRIA PARA REVISITAR':'UM CARINHO QUE O DESTINO GUARDOU'}</span>
   <h1 ref={heading} tabIndex={-1}>{card?.title??'Um encanto para minha gatinha!'}</h1>
   <blockquote>“{spin.message}”</blockquote>
   <article className="revealed-prize"><div className="icon-tile"><PrizeIcon name={spin.rewardSnapshot.icon} size={30}/></div><div><span className="eyebrow">SEU MIMO</span><h2>{spin.rewardSnapshot.name}</h2><p>{spin.rewardSnapshot.description}</p></div></article>
   <p className="conquest-date"><Heart size={14}/>Conquistado por Ana Flávia<time dateTime={spin.earnedAt}>{formatDate(spin.earnedAt)}</time></p>
   <button className="primary full" disabled={busy} onClick={()=>onLeave('chest')}><Gift size={18}/>{replay?'Ver meus Encantos':'Guardar no Baú'}</button>
   {!replay&&<button className="text-button full" disabled={busy} onClick={()=>onLeave('chest')}>Ver meus Encantos <ArrowRight size={15}/></button>}
   <button className="secondary full" onClick={onShare}><Share2 size={16}/>Compartilhar com a Carol</button>
   <button className="text-button full" disabled={busy} onClick={()=>onLeave('home')}>Voltar ao Santuário <ArrowRight size={15}/></button>
   <p className="small-note">Seu mimo já está guardado. Meu carinho por você não depende de nenhuma tarefa.</p>
   <p role="status" className="feedback">{notice}</p>{error&&<p className="feedback error" role="alert">{error}</p>}
  </motion.div>
 </section>;
}
