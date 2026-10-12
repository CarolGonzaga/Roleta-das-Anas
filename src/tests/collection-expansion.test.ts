import { describe, expect, it } from 'vitest';
import { redemptionCodes } from '../data/redemptionCodes';
import { rewards } from '../data/rewards';
import { createSpin, eligibleRewards, initialState, mergeBackup, parseBackup, readState, validateCode } from '../services/game';

function previousCollection(count=10) {
 let state=initialState();
 for(let i=0;i<count;i++) {
  state=createSpin(state,redemptionCodes[i],()=>0);
  const spin=state.spins.at(-1)!;
  spin.animationCompleted=true;
  if(i%2===0){spin.status='received';spin.receivedAt='2026-10-09T15:00:00.000Z';}
 }
 state.settings={audioEnabled:true,reducedMotion:true};
 return state;
}

describe('expansão da coleção com oito recompensas',()=>{
 it('mantém IDs e ícones dos dez prêmios antigos e adiciona oito IDs únicos',()=>{
  expect(rewards.slice(0,10).map(r=>[r.id,r.icon])).toEqual([
   [1,'Candy'],[2,'HeartHandshake'],[3,'UtensilsCrossed'],[4,'ShoppingBag'],[5,'Coffee'],
   [6,'BedDouble'],[7,'HandHeart'],[8,'CupSoda'],[9,'Clock'],[10,'IceCreamBowl'],
  ]);
  expect(rewards.slice(10).map(r=>r.id)).toEqual([11,12,13,14,15,16,17,18]);
  expect(new Set(rewards.map(r=>r.id)).size).toBe(18);
  expect(rewards.slice(10).every(r=>r.weight===1&&r.enabled)).toBe(true);
 });

 it('disponibiliza as oito novas recompensas após completar as dez anteriores',()=>{
  const previous=previousCollection();
  const restored=readState({getItem:()=>JSON.stringify(previous)});
  expect(restored).toEqual(previous);
  expect(eligibleRewards(restored).map(r=>r.id)).toEqual([11,12,13,14,15,16,17,18]);
  for(const code of previous.usedCodes)expect(()=>validateCode(code,restored)).toThrow(/já foi usado/);
 });

 it('sorteia as oito novas uma vez cada, sem alterar registros ou preferências anteriores',()=>{
  const previous=previousCollection();
  let next=parseBackup(JSON.stringify(previous));
  for(let i=10;i<18;i++) {
   next=createSpin(next,redemptionCodes[i],()=>0);
   next.spins.at(-1)!.animationCompleted=true;
   expect(next.spins.at(-1)!.rewardSnapshot.id).toBe(i+1);
  }
  expect(next.spins.slice(0,10)).toEqual(previous.spins);
  expect(next.usedCodes.slice(0,10)).toEqual(previous.usedCodes);
  expect(next.settings).toEqual(previous.settings);
  expect(new Set(next.spins.map(s=>s.rewardSnapshot.id)).size).toBe(18);
  expect(eligibleRewards(next)).toEqual([]);
  expect(()=>createSpin(next,redemptionCodes[18])).toThrow(/Nenhum código foi consumido/);
  expect(next.usedCodes).not.toContain(redemptionCodes[18]);
  expect(parseBackup(JSON.stringify(next))).toEqual(next);
  expect(mergeBackup(next,previous)).toEqual(next);
 });

 it('preserva histórico v1 e mantém tanto prêmios recebidos quanto pendentes fora do sorteio',()=>{
  const previous=previousCollection(2);
  const legacy={...previous,version:1,spins:previous.spins.map(spin=>({...spin,cardSnapshot:undefined}))};
  const restored=parseBackup(JSON.stringify(legacy));
  expect(restored.spins.map(s=>s.rewardSnapshot)).toEqual(previous.spins.map(s=>s.rewardSnapshot));
  expect(restored.spins.map(s=>s.status)).toEqual(['received','waiting']);
  expect(restored.usedCodes).toEqual(previous.usedCodes);
  expect(eligibleRewards(restored)).toHaveLength(16);
  expect(eligibleRewards(restored).map(r=>r.id)).not.toContain(1);
  expect(eligibleRewards(restored).map(r=>r.id)).not.toContain(2);
 });
});
