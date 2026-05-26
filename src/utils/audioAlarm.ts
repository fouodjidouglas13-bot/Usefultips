/**
 * Web Audio API based synthesized alarm sound.
 * No external static sound assets required.
 */

let audioCtx: AudioContext | null = null;

export function playAlarmChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    // Force resume if suspended due to browser autoplay policies
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Create a pleasant double-pulse retro alarm chime
    const playTone = (time: number, freq: number, duration: number) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const oscHarmonic = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Add a higher warm harmonic for a clear bell tone
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 1.5, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time);
      oscHarmonic.start(time);

      osc.stop(time + duration);
      oscHarmonic.stop(time + duration);
    };

    // Synthesize "Ding! Ding! Ding!" wake-up pattern
    playTone(now, 659.25, 0.4); // E5
    playTone(now + 0.15, 783.99, 0.4); // G5
    
    playTone(now + 0.45, 659.25, 0.4); // E5
    playTone(now + 0.60, 783.99, 0.4); // G5

    playTone(now + 0.90, 880.00, 0.6); // A5 (Peak peak)
    playTone(now + 1.05, 1046.50, 0.6); // C6

  } catch (err) {
    console.warn('AudioContext failed to trigger due to auto-play rules:', err);
  }
}
