import { describe, it, expect } from 'vitest';
import { RandomVideoTracker } from '../src/utils/randomVideoTracker';

describe('RandomVideoTracker', () => {
  it('returns all videos before repeating', () => {
    const videos = ['a.mp4', 'b.mp4', 'c.mp4'];
    const tracker = new RandomVideoTracker(videos);
    const played = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const v = tracker.next()!;
      expect(videos).toContain(v);
      played.add(v);
    }
    expect(played.size).toBe(3);
  });

  it('resets queue when exhausted', () => {
    const tracker = new RandomVideoTracker(['a.mp4']);
    expect(tracker.next()).toBe('a.mp4');
    expect(tracker.next()).toBe('a.mp4');
  });

  it('returns null for empty pool', () => {
    const tracker = new RandomVideoTracker([]);
    expect(tracker.next()).toBeNull();
  });

  it('updatePool replaces videos', () => {
    const tracker = new RandomVideoTracker(['a.mp4']);
    tracker.updatePool(['x.mp4', 'y.mp4']);
    const picked = new Set<string>();
    picked.add(tracker.next()!);
    picked.add(tracker.next()!);
    expect(picked.has('x.mp4')).toBe(true);
    expect(picked.has('y.mp4')).toBe(true);
  });

  it('tracks played count', () => {
    const tracker = new RandomVideoTracker(['a.mp4', 'b.mp4']);
    expect(tracker.playedCount).toBe(0);
    tracker.next();
    expect(tracker.playedCount).toBe(1);
  });

  it('reset restarts shuffle', () => {
    const tracker = new RandomVideoTracker(['a.mp4', 'b.mp4']);
    tracker.next();
    tracker.reset();
    expect(tracker.playedCount).toBe(0);
  });

  it('total returns pool size', () => {
    const tracker = new RandomVideoTracker(['a.mp4', 'b.mp4', 'c.mp4']);
    expect(tracker.total).toBe(3);
  });
});
