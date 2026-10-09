export interface Reward { id: number; name: string; shortName: string; description: string; icon: string; category: string; weight: number; enabled: boolean; maxAwards: number | null }
export interface Spin { id: string; code: string; rewardSnapshot: Reward; message: string; earnedAt: string; animationCompleted: boolean; status: 'waiting' | 'received'; receivedAt: string | null }
export interface Settings { audioEnabled: boolean; reducedMotion: boolean }
export interface AppState { version: 1; spins: Spin[]; usedCodes: string[]; settings: Settings }
