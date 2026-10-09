let context: AudioContext | null = null;
export function playTone(kind: 'start' | 'tick' | 'win', enabled: boolean) {
 if(!enabled) return;
 try {
  context ??= new AudioContext();
  void context.resume();
  const notes = kind === 'win' ? [523,659,784,1047] : kind === 'start' ? [330,440,660] : [280];
  notes.forEach((frequency,i) => {
   const oscillator = context!.createOscillator(), gain = context!.createGain(), start = context!.currentTime+i*.12;
   oscillator.type='sine'; oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.035,start+.01);gain.gain.exponentialRampToValueAtTime(.001,start+.18);
   oscillator.connect(gain);gain.connect(context!.destination);oscillator.start(start);oscillator.stop(start+.2);
  });
 } catch { /* Áudio é opcional; sua indisponibilidade não interrompe o resgate. */ }
}
