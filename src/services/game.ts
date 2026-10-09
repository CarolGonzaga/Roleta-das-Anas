import { redemptionCodes } from '../data/redemptionCodes';
import { rewards } from '../data/rewards';
import { messages } from '../data/messages';
import type { AppState, Reward, Spin } from '../types';

export const STORAGE_KEY = 'roleta-das-anas:v1';
export const normalizeCode = (code: string) => code.trim().toUpperCase();
const knownCodes: ReadonlySet<string> = new Set(redemptionCodes);
export function initialState(): AppState { return {version:1,spins:[],usedCodes:[],settings:{audioEnabled:false,reducedMotion:false}}; }
export function validateCode(code: string, state: AppState): string {
 const normalized = normalizeCode(code);
 if (!knownCodes.has(normalized)) throw new Error('Hmm... esse feitiço não está no nosso grimório, gatinha. Confere o código com a Carol?');
 if (state.usedCodes.includes(normalized)) throw new Error('Esse encanto já foi usado, meu amor! Peça outro código à Carol.');
 return normalized;
}
export function randomUnit(): number { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }
export function eligibleRewards(state: AppState, pool: Reward[] = rewards): Reward[] {
 return pool.filter(r => r.enabled && r.weight > 0 && Number.isFinite(r.weight) && (r.maxAwards === null || state.spins.filter(s => s.rewardSnapshot.id === r.id).length < r.maxAwards));
}
export function selectReward(pool: Reward[], random = randomUnit): Reward {
 const total = pool.reduce((sum,r) => sum+r.weight,0);
 if (!pool.length || !Number.isFinite(total) || total <= 0) throw new Error('Os encantos estão descansando. Fale com a Carol.');
 let cursor = random()*total;
 for (const reward of pool) { cursor -= reward.weight; if(cursor < 0) return reward; }
 return pool[pool.length-1];
}
export function createSpin(state: AppState, rawCode: string, random = randomUnit): AppState {
 const code = validateCode(rawCode,state);
 if(state.spins.some(s => !s.animationCompleted)) throw new Error('Há um encanto esperando para ser revelado.');
 const reward = selectReward(eligibleRewards(state),random);
 const spin: Spin = {id:crypto.randomUUID(),code,rewardSnapshot:{...reward},message:messages[Math.floor(random()*messages.length)],earnedAt:new Date().toISOString(),animationCompleted:false,status:'waiting',receivedAt:null};
 return {...state,usedCodes:[...state.usedCodes,code],spins:[...state.spins,spin]};
}
export function wheelAngle(index: number, count: number): number { return 360*6 + (360-(index+.5)*360/count); }

// Validação também é aplicada ao armazenamento: dados inválidos nunca são sobrescritos silenciosamente.
export function parseBackup(raw: string): AppState {
 if(raw.length > 2_000_000) throw new Error('Esse arquivo é grande demais para um backup do grimório.');
 let data: unknown;
 try { data = JSON.parse(raw); } catch { throw new Error('Não consegui ler esse JSON. Escolha um backup exportado pelo grimório.'); }
 const fail = () => { throw new Error('O backup não tem um formato válido ou pertence a outra versão do grimório.'); };
 if(!data || typeof data !== 'object') return fail();
 const d = data as AppState;
 if(d.version !== 1 || !Array.isArray(d.spins) || !Array.isArray(d.usedCodes) || !d.settings || typeof d.settings.audioEnabled !== 'boolean' || typeof d.settings.reducedMotion !== 'boolean') return fail();
 if(d.spins.length > 100 || d.usedCodes.length > 100 || new Set(d.usedCodes).size !== d.usedCodes.length || d.usedCodes.some(c => !knownCodes.has(c))) return fail();
 const ids = new Set<string>(), codes = new Set<string>();
 const validDate = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
 const validText = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 2000;
 const spins: Spin[] = [];
 for(const s of d.spins) {
  if(!s || !validText(s.id) || ids.has(s.id) || !knownCodes.has(s.code) || codes.has(s.code) || !d.usedCodes.includes(s.code) || !validDate(s.earnedAt) || !validText(s.message) || typeof s.animationCompleted !== 'boolean' || !['waiting','received'].includes(s.status) || (s.status === 'received' ? !validDate(s.receivedAt) : s.receivedAt !== null)) return fail();
  const r = s.rewardSnapshot;
  if(!r || !rewards.some(x => x.id === r.id && x.icon === r.icon) || !validText(r.name) || !validText(r.shortName) || !validText(r.description) || !validText(r.category) || typeof r.enabled !== 'boolean' || !Number.isFinite(r.weight) || r.weight < 0 || !(r.maxAwards === null || (Number.isInteger(r.maxAwards) && r.maxAwards >= 0))) return fail();
  ids.add(s.id); codes.add(s.code);
  spins.push({id:s.id,code:s.code,rewardSnapshot:{id:r.id,name:r.name,shortName:r.shortName,description:r.description,icon:r.icon,category:r.category,weight:r.weight,enabled:r.enabled,maxAwards:r.maxAwards},message:s.message,earnedAt:s.earnedAt,animationCompleted:s.animationCompleted,status:s.status,receivedAt:s.receivedAt});
 }
 return {version:1,spins,usedCodes:[...d.usedCodes],settings:{audioEnabled:d.settings.audioEnabled,reducedMotion:d.settings.reducedMotion}};
}
export function mergeBackup(current: AppState, incoming: AppState): AppState {
 const spins = current.spins.map(s => ({...s}));
 for(const candidate of incoming.spins) {
  const existing = spins.find(s => s.code === candidate.code);
  if(existing) {
   // Um backup antigo jamais apaga o resultado local ou reverte um mimo recebido.
   if(existing.id === candidate.id) {
    existing.animationCompleted ||= candidate.animationCompleted;
    if(candidate.status === 'received' && existing.status !== 'received') {existing.status='received';existing.receivedAt=candidate.receivedAt;}
   }
  } else if(!current.usedCodes.includes(candidate.code)) {
   if(spins.some(s => s.id === candidate.id)) throw new Error('Há identificadores conflitantes no backup. Seus dados foram preservados.');
   spins.push({...candidate});
  }
 }
 return {...current,spins,usedCodes:[...new Set([...current.usedCodes,...incoming.usedCodes])],settings:{...incoming.settings}};
}
export function readState(storage: Pick<Storage,'getItem'> = localStorage): AppState {
 const raw = storage.getItem(STORAGE_KEY);
 return raw === null ? initialState() : parseBackup(raw);
}
export function writeState(state: AppState, storage: Pick<Storage,'setItem'> = localStorage): void {
 try { storage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch { throw new Error('Não consegui guardar sua magia. Libere espaço ou permita o armazenamento deste site e tente novamente.'); }
}
export async function updateState(update: (state: AppState) => AppState): Promise<AppState> {
 // Web Locks serializa leitura + escrita entre abas da mesma origem.
 if(!navigator.locks) throw new Error('Este navegador não permite proteger seus resgates entre abas. Abra em uma versão atual do Chrome, Safari, Edge ou Firefox.');
 return navigator.locks.request('roleta-das-anas:transaction',() => {
  const next = update(readState()); writeState(next); return next;
 });
}
