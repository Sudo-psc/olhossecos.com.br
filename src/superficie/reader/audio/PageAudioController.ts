import type { PageAudio } from "./PageAudio.ts";

interface AudioLike {
  currentTime: number;
  volume: number;
  play(): Promise<void> | void;
}

type AudioFactory = (source: string) => AudioLike;

export class PageAudioController implements PageAudio {
  private enabled = false;
  private soundIndex = 0;
  private readonly sources: string[];
  private readonly createAudio: AudioFactory;

  constructor(
    sources: string[],
    createAudio: AudioFactory = (source) => new Audio(source),
  ) {
    this.sources = sources;
    this.createAudio = createAudio;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  playTurn(): void {
    if (!this.enabled || this.sources.length === 0) return;
    const source = this.sources[this.soundIndex % this.sources.length];
    this.soundIndex += 1;
    const audio = this.createAudio(source);
    audio.volume = 0.14;
    audio.currentTime = 0;
    void Promise.resolve(audio.play()).catch(() => undefined);
  }
}
