export class RandomVideoTracker {
  private queue: string[] = [];
  private allVideos: string[] = [];

  constructor(videos: string[]) {
    this.allVideos = [...videos];
    this.shuffle();
  }

  updatePool(videos: string[]): void {
    this.allVideos = [...videos];
    this.shuffle();
  }

  next(): string | null {
    if (this.allVideos.length === 0) return null;
    if (this.queue.length === 0) this.shuffle();
    return this.queue.pop()!;
  }

  private shuffle(): void {
    this.queue = [...this.allVideos];
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
  }

  reset(): void {
    this.shuffle();
  }

  get playedCount(): number {
    return this.allVideos.length - this.queue.length;
  }

  get total(): number {
    return this.allVideos.length;
  }
}
