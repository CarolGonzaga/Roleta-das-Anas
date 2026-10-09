import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookHeart, Check, Gift, Heart, Home as HomeIcon, KeyRound, Moon, Settings2, Share2, Sparkles, WandSparkles } from 'lucide-react';
import type { AppState, Settings as SettingsType, Spin } from './types';
import { createSpin, eligibleRewards, mergeBackup, readState, STORAGE_KEY, updateState, validateCode, wheelAngle } from './services/game';
import { playTone } from './services/audio';
import { Wheel } from './components/Wheel';
import { Dialog } from './components/Dialog';
import { PrizeIcon } from './components/Icon';
import { Settings, downloadJson } from './components/Settings';
import { Home } from './pages/Home';
import { Chest, formatDate } from './pages/Chest';

type Page='home'|'wheel'|'chest';
const navigation=[{id:'home' as const,label:'Meu Cantinho',icon:HomeIcon},{id:'wheel' as const,label:'Roleta Mágica',icon:Sparkles},{id:'chest' as const,label:'Baú dos Encantos',icon:Gift}];
export default function App() {
 const [load]=useState(()=>{try{return {state:readState(),error:''};}catch(e){return {state:null,error:(e as Error).message};}});
 if(!load.state) return <main className="storage-error"><BookHeart size={45}/><h1>Vamos proteger seu grimório.</h1><p>Não foi possível abrir o armazenamento. Seus dados não foram substituídos.</p><p>{load.error}</p><button className="secondary" onClick={()=>{try{downloadJson(localStorage.getItem(STORAGE_KEY)??'{}','grimorio-recuperacao.json');}catch{ /* Acesso bloqueado pelo navegador. */ }}}>Salvar dados para recuperação</button><button className="primary" onClick={()=>location.reload()}>Tentar novamente</button></main>;
 return <Experience initial={load.state}/>;
}
function Experience({initial}:{initial:AppState}) {
 const [state,setState]=useState(initial),[page,setPage]=useState<Page>('home'),[ready,setReady]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[spinning,setSpinning]=useState(false),[angle,setAngle]=useState(0),[result,setResult]=useState<Spin|null>(null),[showSettings,setShowSettings]=useState(false),[shared,setShared]=useState(''),[systemReduced,setSystemReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const operation=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),ticks=useRef<ReturnType<typeof setInterval>|null>(null),heading=useRef<HTMLElement>(null);
 const reduced=state.settings.reducedMotion||systemReduced;
 const pool=eligibleRewards(state);
 // As nove fatias permanecem durante o giro, mesmo após o prêmio ser registrado.
 const [spinPool,setSpinPool]=useState(pool);
 const transact=useCallback(async(update:(s:AppState)=>AppState)=>{if(operation.current)throw new Error('Aguarde um instante enquanto guardamos seu encanto.');operation.current=true;setBusy(true);try{const next=await updateState(update);setState(next);return next;}finally{operation.current=false;setBusy(false);}},[]);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setSystemReduced(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change);},[]);
 useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===STORAGE_KEY){try{setState(readState());}catch(err){setError((err as Error).message);}}};addEventListener('storage',sync);return()=>removeEventListener('storage',sync);},[]);
 useEffect(()=>{if(!spinning&&!result&&!showSettings){const pending=state.spins.find(s=>!s.animationCompleted);if(pending){setResult(pending);setPage('wheel');}}},[state,spinning,result,showSettings]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(ticks.current)clearInterval(ticks.current);},[]);
 function navigate(next:Page){setPage(next);setError('');setShared('');requestAnimationFrame(()=>{heading.current?.focus();window.scrollTo({top:0,behavior:'instant'});});}
 async function validate(code:string){try{const latest=readState();setState(latest);const valid=validateCode(code,latest);setReady(valid);setAngle(0);setSpinPool(eligibleRewards(latest));navigate('wheel');}catch(e){setError((e as Error).message);}}
 async function spin(){if(spinning||operation.current)return;setError('');try{
  let drawn:Spin|undefined;let available=pool;
  await transact(current=>{available=eligibleRewards(current);const next=createSpin(current,ready);drawn=next.spins.at(-1);return next;});
  if(!drawn)return;const prize=drawn;setSpinPool(available);setReady('');setSpinning(true);setAngle(wheelAngle(available.findIndex(r=>r.id===prize.rewardSnapshot.id),available.length));playTone('start',state.settings.audioEnabled);
  if(state.settings.audioEnabled&&!reduced){let count=0;ticks.current=setInterval(()=>{playTone('tick',true);if(++count>=20&&ticks.current)clearInterval(ticks.current);},230);}
  timer.current=setTimeout(()=>{if(ticks.current)clearInterval(ticks.current);setSpinning(false);setResult(prize);playTone('win',state.settings.audioEnabled);},reduced?350:6100);
 }catch(e){setError((e as Error).message);}}
 async function closeResult(toChest=false){if(!result)return;try{await transact(current=>({...current,spins:current.spins.map(s=>s.id===result.id?{...s,animationCompleted:true}:s)}));setResult(null);setShared('');if(toChest)navigate('chest');}catch(e){setError((e as Error).message);}}
 async function receive(id:string){try{await transact(current=>({...current,spins:current.spins.map(s=>s.id===id&&s.status==='waiting'?{...s,status:'received',receivedAt:new Date().toISOString()}:s)}));setError('');}catch(e){setError((e as Error).message);}}
 async function saveSettings(settings:SettingsType){await transact(current=>({...current,settings}));setError('');}
 async function share(){if(!result)return;const text=`Amor, acabei de ganhar ${result.rewardSnapshot.name} na Roleta das Anas!`;try{if(navigator.share){await navigator.share({title:'Um encanto para minha gatinha!',text});setShared('Seu encanto foi compartilhado.');}else{await navigator.clipboard.writeText(text);setShared('Mensagem copiada para enviar à Carol.');}}catch(e){if((e as Error).name!=='AbortError')setShared(`Copie esta mensagem: ${text}`);}}
 return <div className={`app ${reduced?'reduced-motion':''}`}><div className="stars" aria-hidden="true">{Array.from({length:34},(_,i)=><span key={i} style={{left:`${(i*37+11)%100}%`,top:`${(i*23+3)%100}%`,opacity:.15+(i%4)*.1}}/>)}</div>
  <header className="site-header"><button className="brand" onClick={()=>navigate('home')} aria-label="Roleta das Anas, início"><span className="brand-mark"><Moon size={26}/><Sparkles size={12}/></span><span>Roleta das Anas<small>O GRIMÓRIO DAS RECOMPENSAS</small></span></button><nav aria-label="Navegação principal">{navigation.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={17}/>{label}</button>)}</nav><button className="icon-button settings-button" aria-label="Abrir configurações e backups" disabled={spinning} onClick={()=>setShowSettings(true)}><Settings2 size={21}/></button></header>
  <main ref={heading} tabIndex={-1} id="main-content">{page==='home'&&<Home onValidate={validate} ready={ready} error={error} onWheel={()=>navigate('wheel')} busy={busy}/>}
   {page==='wheel'&&<section className="wheel-page"><div className="page-heading"><span className="eyebrow">UM GIRO DE CARINHO</span><h1>Roleta <em>Mágica</em></h1><p>{spinning?'Seu encanto está a caminho, gatinha…':ready?'O grimório reconheceu sua magia. Seu prêmio está esperando!':'Nove possibilidades de te fazer sorrir.'}</p></div><Wheel pool={spinPool} angle={angle} spinning={spinning} reduced={reduced} winner={result?.rewardSnapshot.id}/><div className="spin-actions">{ready||spinning?<><span className="ready-note"><Check size={15}/> {spinning?'Uma surpresa preparada com amor':'Uma rodada desbloqueada'}</span><button className="primary full" disabled={!ready||spinning||busy} onClick={()=>void spin()}><WandSparkles size={20}/>{spinning?'Tecendo sua magia…':'Girar minha roleta'}</button></>:<><p className="locked-note"><KeyRound size={16}/>Recebeu um código da Carol? Ele libera seu giro.</p><button className="primary full" onClick={()=>navigate('home')}>Inserir meu código <ArrowRight size={18}/></button></>}<p className="small-note">Nunca esquece: eu te amo independentemente de qualquer tarefa.</p></div><div role="status">{error&&<p className="feedback error">{error}</p>}</div></section>}
   {page==='chest'&&<><Chest spins={state.spins} onReceive={id=>void receive(id)} busy={busy} onHome={()=>navigate('home')}/>{error&&<p className="feedback error" role="alert">{error}</p>}</>}
  </main><footer><Heart size={13}/><p>Feito com amor, magia e um pouquinho de obsessão pela Ana Flávia.</p><span>COM AMOR, CAROL</span></footer>
  <nav className="mobile-nav" aria-label="Navegação móvel">{navigation.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={21}/>{label}</button>)}</nav>
  {showSettings&&<Settings state={state} onClose={()=>setShowSettings(false)} onSettings={saveSettings} onImport={async backup=>{await transact(current=>mergeBackup(current,backup));}} busy={busy}/>}
  {result&&<Dialog title="Um encanto para minha gatinha!" onClose={()=>void closeResult()}><div className="reveal"><span className="eyebrow"><Sparkles size={15}/> CONQUISTADO POR ANA FLÁVIA</span><div className="reveal-icon"><PrizeIcon name={result.rewardSnapshot.icon} size={55}/></div><h3>{result.rewardSnapshot.name}</h3><p>{result.rewardSnapshot.description}</p><blockquote>“{result.message}”</blockquote><time dateTime={result.earnedAt}>{formatDate(result.earnedAt)}</time><button className="primary full" disabled={busy} onClick={()=>void closeResult(true)}><Gift size={18}/>Guardar no meu baú</button><button className="text-button" disabled={busy} onClick={()=>void closeResult(true)}>Ver meus encantos <ArrowRight size={16}/></button><button className="secondary full" onClick={()=>void share()}><Share2 size={16}/>Compartilhar com a Carol</button><p className="small-note">Seu mimo já está salvo no baú, mesmo se você fechar esta página.</p><p role="status">{shared}</p>{error&&<p className="feedback error" role="alert">{error}</p>}</div></Dialog>}
 </div>;
}
