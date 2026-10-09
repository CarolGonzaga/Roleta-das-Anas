import { describe, expect, it } from 'vitest';
import { createSpin, eligibleRewards, EXHAUSTED_MESSAGE, initialState, mergeBackup, normalizeCode, parseBackup, readState, selectCard, selectReward, STORAGE_KEY, validateCode, wheelAngle, writeState } from '../services/game';
import { cardMessages, tarotCards } from '../data/tarot';
import { redemptionCodes } from '../data/redemptionCodes';
import { rewards } from '../data/rewards';

describe('códigos e resgates',()=>{
 it('contém exatamente 100 códigos únicos, 25 por prefixo',()=>{expect(redemptionCodes).toHaveLength(100);expect(new Set(redemptionCodes).size).toBe(100);for(const prefix of ['ANA','CAROL','LANA','BONNIE'])expect(redemptionCodes.filter(c=>c.startsWith(prefix))).toHaveLength(25);});
 it('normaliza caixa e espaços',()=>{expect(normalizeCode('  ana5421  ')).toBe('ANA5421');expect(validateCode(' ana5421 ',initialState())).toBe('ANA5421');});
 it('recusa códigos inválidos e espaços no meio',()=>{expect(()=>validateCode('ANA0000',initialState())).toThrow();expect(()=>validateCode('ANA 5421',initialState())).toThrow();});
 it('consome código e salva snapshot e mensagem no mesmo estado',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);expect(state.usedCodes).toEqual(['ANA5421']);expect(state.spins).toHaveLength(1);expect(state.spins[0].rewardSnapshot.id).toBe(1);expect(state.spins[0].message.length).toBeGreaterThan(0);expect(state.spins[0].animationCompleted).toBe(false);});
 it('recusa reutilização mesmo depois de receber o mimo',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);state.spins[0].status='received';state.spins[0].receivedAt=new Date().toISOString();state.spins[0].animationCompleted=true;expect(()=>createSpin(state,'ana5421')).toThrow(/já foi usado/);});
 it('recusa outro sorteio enquanto existe rodada interrompida',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);expect(()=>createSpin(state,'ANA9887')).toThrow(/esperando/);});
 it('recupera o mesmo prêmio após fechar durante animação',()=>{const state=createSpin(initialState(),'ANA5421',()=>.3);const restored=parseBackup(JSON.stringify(state));expect(restored.spins[0]).toEqual(state.spins[0]);expect(restored.spins[0].animationCompleted).toBe(false);expect(()=>createSpin(restored,'ANA5421')).toThrow();});
});
describe('sorteio e roleta',()=>{
 it('seleciona igualmente todos os prêmios pelos intervalos',()=>{for(let i=0;i<rewards.length;i++)expect(selectReward(rewards,()=>(i+.5)/rewards.length).id).toBe(rewards[i].id);});
 it('respeita pesos configurados',()=>{const pool=[{...rewards[0],weight:3},{...rewards[1],weight:1}];expect(selectReward(pool,()=>.74).id).toBe(1);expect(selectReward(pool,()=>.75).id).toBe(2);expect(selectReward(pool,()=>.999999).id).toBe(2);});
 it('exclui prêmios inativos, de peso zero e esgotados',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);const pool=[{...rewards[0],maxAwards:1},{...rewards[1],enabled:false},{...rewards[2],weight:0},rewards[3]];expect(eligibleRewards(state,pool).map(r=>r.id)).toEqual([4]);});
 it('recusa pool vazio',()=>{expect(()=>selectReward([])).toThrow();});
 it('ponteiro coincide com centro de cada fatia após seis voltas',()=>{for(let n=2;n<=9;n++)for(let i=0;i<n;i++){const angle=wheelAngle(i,n);expect(angle).toBeGreaterThanOrEqual(2160);const pointer=(360-angle%360)%360;expect(pointer).toBeCloseTo((i+.5)*360/n,8);}});
});
describe('persistência e backups',()=>{
 it('inicializa sem sobrescrever armazenamento',()=>{let reads=0;expect(readState({getItem:()=>{reads++;return null;}})).toEqual(initialState());expect(reads).toBe(1);});
 it('preserva histórico e preferência ao recarregar',()=>{const values=new Map<string,string>();const storage={setItem:(k:string,v:string)=>{values.set(k,v);},getItem:(k:string)=>values.get(k)??null};const state=createSpin(initialState(),'ANA5421',()=>0);state.settings.audioEnabled=true;writeState(state,storage);expect(readState(storage)).toEqual(state);expect(values.has(STORAGE_KEY)).toBe(true);});
 it('não perde código ou prêmio se escrita falhar',()=>{const before=initialState();const next=createSpin(before,'ANA5421',()=>0);expect(()=>writeState(next,{setItem:()=>{throw new Error('quota');}})).toThrow(/guardar/);expect(before.spins).toHaveLength(0);expect(before.usedCodes).toHaveLength(0);});
 it('faz exportação e restauração completas',()=>{const state=createSpin(initialState(),'ANA5421',()=>.5);expect(parseBackup(JSON.stringify(state))).toEqual(state);});
 it('recusa JSON inválido e versões desconhecidas',()=>{expect(()=>parseBackup('{')).toThrow();expect(()=>parseBackup(JSON.stringify({...initialState(),version:3}))).toThrow();});
 it('recusa códigos duplicados e referências quebradas',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);expect(()=>parseBackup(JSON.stringify({...state,spins:[state.spins[0],state.spins[0]]}))).toThrow();expect(()=>parseBackup(JSON.stringify({...state,usedCodes:[]}))).toThrow();expect(()=>parseBackup(JSON.stringify({...state,usedCodes:['ANA0000']}))).toThrow();});
 it('recusa snapshots e datas inválidos',()=>{const state=createSpin(initialState(),'ANA5421',()=>0);state.spins[0].earnedAt='invalida';expect(()=>parseBackup(JSON.stringify(state))).toThrow();state.spins[0].earnedAt=new Date().toISOString();state.spins[0].rewardSnapshot.icon='fake';expect(()=>parseBackup(JSON.stringify(state))).toThrow();});
 it('mescla sem duplicar e preserva recebido contra backup antigo',()=>{const old=createSpin(initialState(),'ANA5421',()=>0);const current=parseBackup(JSON.stringify(old));current.spins[0].status='received';current.spins[0].receivedAt=new Date().toISOString();current.spins[0].animationCompleted=true;const merged=mergeBackup(current,old);expect(merged.spins).toHaveLength(1);expect(merged.spins[0].status).toBe('received');expect(merged.spins[0].animationCompleted).toBe(true);});
 it('mescla recompensas diferentes e mantém código consumido',()=>{const current=createSpin(initialState(),'ANA5421',()=>0),incoming=createSpin(initialState(),'ANA9887',()=>.5);const merged=mergeBackup(current,incoming);expect(merged.spins).toHaveLength(2);expect(merged.usedCodes).toHaveLength(2);});
 it('mantém resultado local quando o mesmo código foi sorteado em outro aparelho',()=>{const current=createSpin(initialState(),'ANA5421',()=>0),incoming=createSpin(initialState(),'ANA5421',()=>.5);const merged=mergeBackup(current,incoming);expect(merged.spins).toEqual(current.spins);});
 it('incorpora recebido sem modificar o estado anterior',()=>{const current=createSpin(initialState(),'ANA5421',()=>0),incoming=parseBackup(JSON.stringify(current));incoming.spins[0].status='received';incoming.spins[0].receivedAt=new Date().toISOString();const merged=mergeBackup(current,incoming);expect(merged.spins[0].status).toBe('received');expect(current.spins[0].status).toBe('waiting');});
});

describe('oráculo e coleção sem repetição',()=>{
 it('sorteia as quatro cartas em intervalos iguais de 25%',()=>{
  for(let i=0;i<4;i++)expect(selectCard(()=>(i+.5)/4)).toEqual(tarotCards[i]);
 });
 it('escolhe carta, prêmio e mensagem em chamadas aleatórias independentes',()=>{
  const values=[.01,.95,.6];
  const state=createSpin(initialState(),'ANA5421',()=>values.shift()!);
  expect(state.spins[0].cardSnapshot?.id).toBe('sun');
  expect(state.spins[0].rewardSnapshot.id).toBe(rewards.at(-1)!.id);
  expect(state.spins[0].message).toBe(cardMessages.sun[3]);
  expect(values).toHaveLength(0);
 });
 it('cada uma das quatro cartas pode revelar qualquer prêmio disponível',()=>{
  for(let c=0;c<4;c++)for(let r=0;r<rewards.length;r++){
   const values=[(c+.5)/4,(r+.5)/rewards.length,0];
   const spin=createSpin(initialState(),'ANA5421',()=>values.shift()!).spins[0];
   expect(spin.cardSnapshot?.id).toBe(tarotCards[c].id);
   expect(spin.rewardSnapshot.id).toBe(r+1);
   expect(cardMessages[tarotCards[c].id]).toContain(spin.message);
  }
 });
 it('todos os mimos saem uma única vez e o código seguinte não é consumido',()=>{
  let state=initialState();
  for(let i=0;i<rewards.length;i++){
   state=createSpin(state,redemptionCodes[i],()=>0);
   state.spins.at(-1)!.animationCompleted=true;
  }
  expect(new Set(state.spins.map(s=>s.rewardSnapshot.id)).size).toBe(rewards.length);
  expect(eligibleRewards(state)).toEqual([]);
  expect(()=>createSpin(state,redemptionCodes[rewards.length],()=>0)).toThrow(EXHAUSTED_MESSAGE);
  expect(state.usedCodes).not.toContain(redemptionCodes[rewards.length]);
  expect(state.spins).toHaveLength(rewards.length);
 });
 it('receber um mimo não o recoloca no sorteio',()=>{
  const state=createSpin(initialState(),'ANA5421',()=>0);
  state.spins[0].status='received';state.spins[0].receivedAt=new Date().toISOString();
  expect(eligibleRewards(state).some(r=>r.id===1)).toBe(false);
 });
 it('restauração e mescla mantêm os prêmios conquistados indisponíveis',()=>{
  const restored=parseBackup(JSON.stringify(createSpin(initialState(),'ANA5421',()=>0)));
  const merged=mergeBackup(initialState(),restored);
  expect(eligibleRewards(merged).map(r=>r.id)).not.toContain(1);
 });
 it('migra backups v1 sem apagar histórico, inventar cartas ou liberar códigos',()=>{
  const current=createSpin(initialState(),'ANA5421',()=>0);
  const {cardSnapshot: omitted,...legacySpin}=current.spins[0];
  expect(omitted).not.toBeNull();
  const raw=JSON.stringify({...current,version:1,spins:[legacySpin]});
  const migrated=parseBackup(raw);
  expect(migrated.version).toBe(2);
  expect(migrated.spins[0].cardSnapshot).toBeNull();
  expect(migrated.spins[0].rewardSnapshot).toEqual(legacySpin.rewardSnapshot);
  expect(migrated.spins[0].message).toBe(legacySpin.message);
  expect(migrated.usedCodes).toEqual(['ANA5421']);
  expect(eligibleRewards(migrated).map(r=>r.id)).not.toContain(1);
 });
 it('preserva repetições antigas como histórico, impedindo novas concessões desses prêmios',()=>{
  const state=createSpin(initialState(),'ANA5421',()=>0);
  const duplicate={...state.spins[0],id:'legacy-second',code:'ANA9887'};
  const restored=parseBackup(JSON.stringify({...state,spins:[state.spins[0],duplicate],usedCodes:['ANA5421','ANA9887']}));
  expect(restored.spins).toHaveLength(2);
  expect(eligibleRewards(restored).some(r=>r.id===1)).toBe(false);
 });
 it('recusa imagens externas, IDs de carta desconhecidos e snapshots incompletos',()=>{
  const state=createSpin(initialState(),'ANA5421',()=>0);
  state.spins[0].cardSnapshot!.image='https://example.com/fake.png';
  expect(()=>parseBackup(JSON.stringify(state))).toThrow();
  const valid=createSpin(initialState(),'ANA5421',()=>0);
  expect(()=>parseBackup(JSON.stringify({...valid,spins:[{...valid.spins[0],cardSnapshot:undefined}]}))).toThrow();
 });
 it('preserva carta e mensagem ao recarregar durante a revelação',()=>{
  const state=createSpin(initialState(),'ANA5421',()=>.7);
  const restored=readState({getItem:()=>JSON.stringify(state)});
  expect(restored.spins[0]).toEqual(state.spins[0]);
  expect(restored.spins[0].cardSnapshot?.id).toBe('strength');
 });
 it('o ângulo final aponta para a carta persistida nos quatro resultados',()=>{
  for(let i=0;i<4;i++){
   const angle=wheelAngle(i,4);const pointer=(360-angle%360)%360;
   expect(pointer).toBeCloseTo((i+.5)*90,8);
  }
 });
});
