import { assetUrl } from './assetUrl';

/**
 * Audio controller for background soundtrack and interaction sound effects
 */

class SoundController {
  private bgAudio: HTMLAudioElement | null = null;
  private releaseAudio: HTMLAudioElement | null = null;
  private hoverAudios: HTMLAudioElement[] = [];
  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Lazy initialize on first user gesture
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      this.bgAudio = new Audio(assetUrl('/audio/BG_music_ST.mp3'));
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.45;

      this.releaseAudio = new Audio(assetUrl('/audio/ReleaseSpirit.mp3'));
      this.releaseAudio.volume = 0.7;

      for (let i = 1; i <= 3; i++) {
        const a = new Audio(assetUrl(`/audio/hover${i}.mp3`));
        a.volume = 0.25;
        this.hoverAudios.push(a);
      }
      this.isInitialized = true;
    } catch {
      // Audio not permitted yet
    }
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public toggleSound(): boolean {
    this.init();
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.bgAudio?.play().catch(() => {});
    } else {
      this.bgAudio?.pause();
    }
    this.notify();
    return this.isMuted;
  }

  public setSound(enabled: boolean) {
    this.init();
    this.isMuted = !enabled;
    if (enabled) {
      this.bgAudio?.play().catch(() => {});
    } else {
      this.bgAudio?.pause();
    }
    this.notify();
  }

  public playHover() {
    if (this.isMuted) return;
    this.init();
    if (this.hoverAudios.length > 0) {
      const idx = Math.floor(Math.random() * this.hoverAudios.length);
      const audio = this.hoverAudios[idx];
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  public playRelease() {
    this.init();
    if (this.releaseAudio) {
      this.releaseAudio.currentTime = 0;
      this.releaseAudio.play().catch(() => {});
    }
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    for (const l of this.listeners) {
      l(this.isMuted);
    }
  }
}

export const soundManager = new SoundController();
