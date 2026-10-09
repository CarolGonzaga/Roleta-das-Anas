import { useRef, useState } from 'react';
import { ArrowRight, Heart, KeyRound, Moon, RotateCw, Sparkles, WandSparkles } from 'lucide-react';
import { whispers } from '../data/messages';
import { randomUnit } from '../services/game';
import { Wheel } from '../components/Wheel';
import { PrizeIcon } from '../components/Icon';
import { rewards } from '../data/rewards';
export function Home({onValidate,ready,error,onWheel,busy}:{onValidate:(code:string)=>Promise<void>;ready:string;error:string;onWheel:()=>void;busy:boolean}) {
 const [code,setCode]=useState(''),[whisper,setWhisper]=useState(()=>Math.floor(randomUnit()*whispers.length));
 const input=useRef<HTMLInputElement>(null);
 return <>
  <section className="hero"><div className="eyebrow"><span/> UM UNIVERSO SÓ NOSSO <span/></div><h1>Cada pequena conquista<br/>merece um pouquinho de <em>magia.</em></h1><p>Um pouquinho de magia para a minha bruxinha favorita.</p><div className="hero-star" aria-hidden="true"><Sparkles size={23}/></div></section>
  <div className="home-grid">
   <section className="welcome"><div className="eyebrow"><Heart size={14}/> DE CAROL, PARA ANA FLÁVIA</div><h2>Oi, minha gatinha!</h2><p>Sei que nem todos os dias são fáceis, mas cada coisinha que você consegue fazer merece ser celebrada. Criei esse cantinho para te lembrar do quanto você é incrível e do quanto eu amo cuidar de você.</p><p className="signature">Com todo o meu amor, Carol.</p>
    <section className="code-card"><div className="card-heading"><span className="icon-tile"><KeyRound size={23}/></span><div><h3>Você tem uma recompensa esperando?</h3><p>O código da Carol abre a porta para um mimo.</p></div></div><form onSubmit={e=>{e.preventDefault();void onValidate(code);}}><label htmlFor="redemption">Seu código de resgate</label><div className="code-input"><KeyRound size={17} aria-hidden="true"/><input id="redemption" ref={input} value={code} onChange={e=>setCode(e.target.value)} placeholder="Ex.: ANA5421" autoComplete="off" spellCheck={false} maxLength={30} aria-describedby="code-feedback" aria-invalid={!!error}/></div><button className="primary full" disabled={busy||!code.trim()}><WandSparkles size={18}/>{busy?'Reconhecendo seu encanto…':'Desbloquear minha magia'}<ArrowRight size={17}/></button></form><div id="code-feedback" aria-live="polite">{error&&<p className="feedback error">{error}</p>}{ready&&!error&&<button className="text-button" onClick={onWheel}>Seu encanto está pronto. Ir à roleta <ArrowRight size={15}/></button>}</div><p className="small-note">Um código, um encanto. Simples assim.</p></section>
   </section>
   <section className="wheel-preview"><div className="eyebrow"><Sparkles size={15}/> O CÍRCULO DOS ENCANTOS</div><Wheel pool={rewards} angle={0} spinning={false} reduced={true}/><h3>Nove mimos. Um destino encantado.</h3><p>Um giro, uma surpresa e todo o meu carinho.</p><button className="text-button" onClick={onWheel}>Conhecer a Roleta Mágica <ArrowRight size={16}/></button></section>
  </div>
  <section className="whisper-card"><Moon size={31} strokeWidth={1.2}/><div><span className="eyebrow">SUSSURRO DO GRIMÓRIO</span><p aria-live="polite">“{whispers[whisper]}”</p></div><button className="icon-button" aria-label="Ler outro sussurro" onClick={()=>setWhisper(v=>(v+1+Math.floor(randomUnit()*(whispers.length-1)))%whispers.length)}><RotateCw size={18}/></button></section>
  <section className="prizes-preview"><div className="section-heading"><div><span className="eyebrow">PREPARADOS COM CARINHO</span><h2>Os encantos que te esperam</h2></div><span className="small-note">Todos com a mesma chance de acontecer</span></div><div className="prize-grid">{rewards.map(r=><article className="mini-prize" key={r.id}><PrizeIcon name={r.icon} size={26}/><h3>{r.name}</h3><p>{r.category}</p></article>)}</div></section>
 </>;
}
