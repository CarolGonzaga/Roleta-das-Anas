import { useState } from 'react';
import { ArrowRight, Heart, KeyRound, Moon, RotateCw, Sparkles, WandSparkles } from 'lucide-react';
import { whispers } from '../data/messages';
import { randomUnit } from '../services/game';
import { TarotImage } from '../components/TarotImage';
interface Props {onValidate:(code:string)=>Promise<void>;error:string;onOracle:()=>void;busy:boolean;exhausted:boolean}
export function Home({onValidate,error,onOracle,busy,exhausted}:Props) {
 const [code,setCode]=useState(''),[whisper,setWhisper]=useState(()=>Math.floor(randomUnit()*whispers.length));
 return <>
  <section className="hero"><div className="eyebrow"><span/> UM UNIVERSO SÓ NOSSO <span/></div><h1>O Oráculo dos <em>Encantos</em></h1><p>Minha gatinha, o destino preparou um carinho especial para você.</p><div className="hero-star" aria-hidden="true"><Sparkles size={23}/></div></section>
  <div className="home-grid">
   <section className="welcome"><div className="eyebrow"><Heart size={14}/> DE CAROL, PARA ANA FLÁVIA</div><h2>Oi, minha gatinha!</h2><p>Sei que nem todos os dias são fáceis, mas cada coisinha que você consegue fazer merece ser celebrada. Criei esse cantinho para te lembrar do quanto você é incrível e do quanto eu amo cuidar de você.</p><p className="signature">Com todo o meu amor, Carol.</p>
    <section className="code-card"><div className="card-heading"><span className="icon-tile"><KeyRound size={23}/></span><div><h3>Um carinho guardado só para você.</h3><p>O código da Carol abre as portas do oráculo.</p></div></div>
     {exhausted?<p className="collection-complete">Todos os mimos desta coleção já encontraram você. Seu baú guarda cada um deles, com todo o meu amor.</p>:<form onSubmit={e=>{e.preventDefault();void onValidate(code);}}><label htmlFor="redemption">Seu código de resgate</label><div className="code-input"><KeyRound size={17} aria-hidden="true"/><input id="redemption" value={code} onChange={e=>setCode(e.target.value)} placeholder="O código que a Carol te entregou" autoComplete="off" spellCheck={false} maxLength={30} disabled={busy} aria-describedby="code-feedback" aria-invalid={!!error}/></div><button className="primary full" disabled={busy||!code.trim()}><WandSparkles size={18}/>{busy?'Reconhecendo seu encanto…':'Revelar meu destino'}<ArrowRight size={17}/></button></form>}
     <div id="code-feedback" aria-live="polite">{error&&<p className="feedback error">{error}</p>}</div><p className="small-note">O mimo é surpresa. Nenhum prêmio se repete.</p>
    </section>
   </section>
   <section className="deck-preview"><div className="eyebrow"><Sparkles size={15}/> NOSSO PEQUENO UNIVERSO</div><div className="deck-stack" aria-hidden="true"><div><TarotImage back/></div><div><TarotImage back/></div><div><TarotImage back/></div></div><h3>Quatro cartas. Um destino encantado.</h3><p>Uma surpresa, um carinho e uma história só nossa.</p><button className="text-button" disabled={busy} onClick={onOracle}>Conhecer o Oráculo <ArrowRight size={16}/></button></section>
  </div>
  <section className="whisper-card"><Moon size={31} strokeWidth={1.2}/><div><span className="eyebrow">SUSSURRO DO GRIMÓRIO</span><p aria-live="polite">“{whispers[whisper]}”</p></div><button className="icon-button" aria-label="Ler outro sussurro" onClick={()=>setWhisper(v=>(v+1+Math.floor(randomUnit()*(whispers.length-1)))%whispers.length)}><RotateCw size={18}/></button></section>
 </>;
}
