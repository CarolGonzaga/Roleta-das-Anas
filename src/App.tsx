import { useCallback, useEffect, useRef, useState } from 'react';
import { BookHeart, Gift, Heart, Home as HomeIcon, Moon, Settings2, Sparkles } from 'lucide-react';
import type { AppState, OraclePhase, Settings as SettingsType, Spin } from './types';
import { createSpin, eligibleRewards, mergeBackup, readState, STORAGE_KEY, updateState, validateCode } from './services/game';
import { playTone } from './services/audio';
import { Settings, downloadJson } from './components/Settings';
import { Home } from './pages/Home';
import { Chest } from './pages/Chest';
import { Oracle } from './pages/Oracle';

type Page='home'|'wheel'|'chest';
const navigation=[{id:'home' as const,label:'Meu Cantinho',icon:HomeIcon},{id:'wheel' as const,label:'Oráculo dos Encantos',icon:Sparkles},{id:'chest' as const,label:'Baú dos Encantos',icon:Gift}];
export default function App() {
 const [load]=useState(()=>{try{return {state:readState(),error:''};}catch(e){return {state:null,error:(e as Error).message};}});
 if(!load.state) return <main className="storage-error"><BookHeart size={45}/><h1>Vamos proteger seu grimório.</h1><p>Não foi possível abrir o armazenamento. Seus dados não foram substituídos.</p><p>{load.error}</p><button className="secondary" onClick={()=>{try{downloadJson(localStorage.getItem(STORAGE_KEY)??'{}','grimorio-recuperacao.json');}catch{ /* Acesso bloqueado. */ }}}>Salvar dados para recuperação</button><button className="primary" onClick={()=>location.reload()}>Tentar novamente</button></main>;
 return <Experience initial={load.state}/>;
}
function Experience({initial}:{initial:AppState}) {
 const [state,setState]=useState(initial);
 const [page,setPage]=useState<Page>('home');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [phase,setPhase]=useState<OraclePhase>('idle');
 const [activeSpin,setActiveSpin]=useState<Spin|null>(null);
 const [recovered,setRecovered]=useState(false);
 const [replay,setReplay]=useState(false);
 const [showSettings,setShowSettings]=useState(false);
 const [shared,setShared]=useState('');
 const [systemReduced,setSystemReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const operation=useRef(false),starting=useRef(false),heading=useRef<HTMLElement>(null);
 const reduced=state.settings.reducedMotion||systemReduced;
 const transitioning=!['idle','completed'].includes(phase);
 const exhausted=eligibleRewards(state).length===0;
 const transact=useCallback(async(update:(s:AppState)=>AppState)=>{
  if(operation.current)throw new Error('Aguarde um instante enquanto guardamos seu encanto.');
  operation.current=true;setBusy(true);
  try{const next=await updateState(update);setState(next);return next;}
  finally{operation.current=false;setBusy(false);}
 },[]);
 const handlePhase=useCallback((next:OraclePhase)=>setPhase(next),[]);
 const handleWin=useCallback(()=>playTone('win',state.settings.audioEnabled),[state.settings.audioEnabled]);

 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>setSystemReduced(query.matches);query.addEventListener('change',change);
  return()=>query.removeEventListener('change',change);
 },[]);
 useEffect(()=>{
  const sync=(e:StorageEvent)=>{if(e.key===STORAGE_KEY){try{setState(readState());}catch(err){setError((err as Error).message);}}};
  addEventListener('storage',sync);return()=>removeEventListener('storage',sync);
 },[]);
 useEffect(()=>{
  if(!starting.current&&!busy&&!activeSpin&&!showSettings){
   const pending=state.spins.find(s=>!s.animationCompleted);
   if(pending){setActiveSpin(pending);setRecovered(true);setReplay(false);setPhase('completed');setPage('wheel');}
  }
 },[state,busy,activeSpin,showSettings]);
 useEffect(()=>{
  if(phase!=='spinning'||!state.settings.audioEnabled||reduced)return;
  let count=0;const timer=setInterval(()=>{playTone('tick',true);if(++count>=20)clearInterval(timer);},230);
  return()=>clearInterval(timer);
 },[phase,state.settings.audioEnabled,reduced]);

 function showPage(next:Page) {
  setPage(next);setError('');setShared('');
  requestAnimationFrame(()=>{heading.current?.focus();window.scrollTo({top:0,behavior:'instant'});});
 }
 async function finish(next:Page) {
  if(transitioning||operation.current)return;
  try{
   if(activeSpin&&!activeSpin.animationCompleted&&!replay){
    await transact(current=>({...current,spins:current.spins.map(s=>s.id===activeSpin.id?{...s,animationCompleted:true}:s)}));
   }
   setActiveSpin(null);setReplay(false);setPhase('idle');showPage(next);
  }catch(e){setError((e as Error).message);}
 }
 function navigate(next:Page) {
  if(transitioning||busy)return;
  if(activeSpin){void finish(next);return;}
  showPage(next);
 }
 async function validate(code:string) {
  if(starting.current||operation.current||transitioning)return;
  starting.current=true;setPhase('validating');setError('');
  try{
   validateCode(code,readState());
   let drawn:Spin|null=null;
   await transact(current=>{const next=createSpin(current,code);drawn=next.spins.at(-1)!;return next;});
   setActiveSpin(drawn);setRecovered(false);setReplay(false);setPhase('spinning');
   showPage('wheel');playTone('start',state.settings.audioEnabled);
  }catch(e){setError((e as Error).message);setPhase('idle');}
  finally{starting.current=false;}
 }
 async function receive(id:string) {
  try{await transact(current=>({...current,spins:current.spins.map(s=>s.id===id&&s.status==='waiting'?{...s,status:'received',receivedAt:new Date().toISOString()}:s)}));setError('');}
  catch(e){setError((e as Error).message);}
 }
 async function saveSettings(settings:SettingsType) {await transact(current=>({...current,settings}));setError('');}
 function view(spin:Spin) {setActiveSpin(spin);setRecovered(true);setReplay(true);setPhase('completed');showPage('wheel');}
 async function share() {
  if(!activeSpin)return;
  const text=activeSpin.cardSnapshot?'Amor! A carta '+activeSpin.cardSnapshot.name+' me escolheu e eu ganhei '+activeSpin.rewardSnapshot.name+' na Roleta das Anas!':'Amor, acabei de ganhar '+activeSpin.rewardSnapshot.name+' na Roleta das Anas!';
  try{
   if(navigator.share){await navigator.share({title:'O Oráculo dos Encantos',text});setShared('Seu encanto foi compartilhado.');}
   else{await navigator.clipboard.writeText(text);setShared('Mensagem copiada para enviar à Carol.');}
  }catch(e){if((e as Error).name!=='AbortError')setShared('Copie esta mensagem: '+text);}
 }
 return <div className={'app oracle-theme '+(reduced?'reduced-motion':'')}>
  <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
  <div className="stars" aria-hidden="true">{Array.from({length:34},(_,i)=><span key={i} style={{left:((i*37+11)%100)+'%',top:((i*23+3)%100)+'%',opacity:.15+(i%4)*.1}}/>)}</div>
  <header className="site-header">
   <button className="brand" disabled={transitioning||busy} onClick={()=>navigate('home')} aria-label="Roleta das Anas, início"><span className="brand-mark"><Moon size={26}/><Sparkles size={12}/></span><span>Roleta das Anas<small>O ORÁCULO DOS ENCANTOS</small></span></button>
   <nav aria-label="Navegação principal">{navigation.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} disabled={transitioning||busy} onClick={()=>navigate(id)}><Icon size={17}/>{label}</button>)}</nav>
   <button className="icon-button settings-button" aria-label="Abrir configurações e backups" disabled={transitioning||busy} onClick={()=>setShowSettings(true)}><Settings2 size={21}/></button>
  </header>
  <main ref={heading} tabIndex={-1} id="main-content">
   {page==='home'&&<Home onValidate={validate} error={error} onOracle={()=>navigate('wheel')} busy={busy||transitioning} exhausted={exhausted}/>}
   {page==='wheel'&&<Oracle key={activeSpin?.id??'idle'} spin={activeSpin} recovered={recovered} replay={replay} reduced={reduced} busy={busy} exhausted={exhausted} onPhase={handlePhase} onWin={handleWin} onHome={()=>navigate('home')} onLeave={next=>void finish(next)} onShare={()=>void share()} notice={shared} error={error}/>}
   {page==='chest'&&<><Chest spins={state.spins} onReceive={id=>void receive(id)} busy={busy} onHome={()=>navigate('home')} onView={view}/>{error&&<p className="feedback error" role="alert">{error}</p>}</>}
  </main>
  <footer><Heart size={13}/><p>Feito com amor, magia e um pouquinho de obsessão pela Ana Flávia.</p><span>COM AMOR, CAROL</span></footer>
  <nav className="mobile-nav" aria-label="Navegação móvel">{navigation.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} disabled={transitioning||busy} onClick={()=>navigate(id)}><Icon size={21}/>{label}</button>)}</nav>
  {showSettings&&<Settings state={state} onClose={()=>setShowSettings(false)} onSettings={saveSettings} onImport={async backup=>{await transact(current=>mergeBackup(current,backup));}} busy={busy}/>}
 </div>;
}
