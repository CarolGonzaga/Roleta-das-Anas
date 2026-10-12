import { describe, expect, it } from 'vitest';
import { createSpin, eligibleRewards, initialState, mergeBackup, parseBackup, readState, validateCode } from '../services/game';
import { redemptionCodes } from '../data/redemptionCodes';
import { rewards } from '../data/rewards';

describe('adicionar Vale Sorvete a uma instalação existente',()=>{
 it('mantém os dois resgates anteriores e disponibiliza a recompensa nova',()=>{
  let previous=initialState();
  for(let i=0;i<2;i++){
   previous=createSpin(previous,redemptionCodes[i],()=>0);
   previous.spins.at(-1)!.animationCompleted=true;
  }
  previous.spins[0].status='received';
  previous.spins[0].receivedAt='2026-10-09T15:00:00.000Z';
  previous.settings={audioEnabled:true,reducedMotion:true};
  const raw=JSON.stringify(previous);
  const restored=readState({getItem:()=>raw});
  expect(restored).toEqual(previous);
  expect(eligibleRewards(restored).map(r=>r.id)).toContain(10);
  expect(eligibleRewards(restored).map(r=>r.id)).not.toContain(1);
  expect(eligibleRewards(restored).map(r=>r.id)).not.toContain(2);
  expect(eligibleRewards(restored)).toHaveLength(rewards.length-2);
  expect(()=>validateCode(redemptionCodes[0],restored)).toThrow(/já foi usado/);

  const available=eligibleRewards(restored);
  const values=[0,(available.findIndex(r=>r.id===10)+.5)/available.length,0];
  const next=createSpin(restored,redemptionCodes[2],()=>values.shift()!);
  expect(next.spins.slice(0,2)).toEqual(previous.spins);
  expect(next.usedCodes.slice(0,2)).toEqual(previous.usedCodes);
  expect(next.settings).toEqual(previous.settings);
  expect(next.spins.at(-1)!.rewardSnapshot.name).toBe('Vale Sorvete');
  expect(next.spins.at(-1)!.rewardSnapshot.id).toBe(10);
  expect(next.spins).toHaveLength(3);
  expect(eligibleRewards(next).map(r=>r.id)).not.toContain(10);
  expect(parseBackup(JSON.stringify(next))).toEqual(next);
  expect(mergeBackup(next,previous).spins).toEqual(next.spins);
 });

 it('reabre uma coleção com os nove prêmios antigos completos sem reiniciar o histórico',()=>{
  let previous=initialState();
  for(let i=0;i<9;i++){
   previous=createSpin(previous,redemptionCodes[i],()=>0);
   previous.spins.at(-1)!.animationCompleted=true;
  }
  const restored=parseBackup(JSON.stringify(previous));
  expect(eligibleRewards(restored).map(r=>r.id)).toEqual(rewards.filter(r=>r.id>=10).map(r=>r.id));
  const next=createSpin(restored,redemptionCodes[9],()=>0);
  expect(next.spins.slice(0,9)).toEqual(previous.spins);
  expect(next.spins.at(-1)!.rewardSnapshot.name).toBe('Vale Sorvete');
  expect(eligibleRewards(next).map(r=>r.id)).toEqual(rewards.filter(r=>r.id>10).map(r=>r.id));
 });
});
