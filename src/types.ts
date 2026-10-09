export interface Reward { id: number; name: string; shortName: string; description: string; icon: string; category: string; weight: number; enabled: boolean; maxAwards: number | null }
export type CardId = 'sun' | 'moon' | 'strength' | 'justice';
export interface TarotCard { id: CardId; name: string; english: string; person: string; image: string; icon: 'Sun' | 'Moon' | 'Infinity' | 'Scale'; title: string }
export interface Spin { id: string; code: string; rewardSnapshot: Reward; cardSnapshot: TarotCard | null; message: string; earnedAt: string; animationCompleted: boolean; status: 'waiting' | 'received'; receivedAt: string | null }
export interface Settings { audioEnabled: boolean; reducedMotion: boolean }
export interface AppState { version: 2; spins: Spin[]; usedCodes: string[]; settings: Settings }
export type OraclePhase = 'idle' | 'validating' | 'spinning' | 'selecting-card' | 'moving-card' | 'flipping-card' | 'revealing-reward' | 'completed';
