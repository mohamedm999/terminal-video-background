import * as vscode from 'vscode';
import { SettingsService } from './settingsService';
import { Logger } from './logger';

export class VideoService {
  private static instance: VideoService | null = null;
  private settingsService: SettingsService;
  private disposables: vscode.Disposable[] = [];
  private focusDisposable: vscode.Disposable | null = null;

  private constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  initialize(context: vscode.ExtensionContext): void {
    this.setupFocusHandler(context);
    Logger.info('VideoService initialized');
  }

  private setupFocusHandler(context: vscode.ExtensionContext): void {
    this.focusDisposable = vscode.window.onDidChangeWindowState((e) => {
      const settings = this.settingsService.getSettings();
      if (!settings.enabled) return;

      if (e.focused) {
        this.onWindowFocus();
      } else {
        this.onWindowBlur();
      }
    });

    context.subscriptions.push(this.focusDisposable);
    this.disposables.push(this.focusDisposable);
  }

  private onWindowFocus(): void {
    const video = this.getVideoElement();
    if (!video) return;

    video.play().catch(() => {});
    Logger.debug('Video: window focused, playing');
  }

  private onWindowBlur(): void {
    const video = this.getVideoElement();
    if (!video) return;

    video.pause();
    Logger.debug('Video: window blurred, paused');
  }

  updateVideoElement(settings: {
    opacity: number;
    blur: number;
    brightness: number;
    saturation: number;
    objectFit: string;
    playbackRate: number;
    muted: boolean;
    loop: boolean;
  }): void {
    const video = this.getVideoElement();
    if (!video) return;

    video.style.opacity = String(settings.opacity);
    video.style.filter = `blur(${settings.blur}px) brightness(${settings.brightness}%) saturate(${settings.saturation}%)`;
    video.style.objectFit = settings.objectFit;
    video.playbackRate = settings.playbackRate;
    video.muted = settings.muted;
    video.loop = settings.loop;

    Logger.debug('Video element updated');
  }

  updateVideoSource(videoPath: string): void {
    const video = this.getVideoElement();
    if (!video) return;

    const videoUrl = `vscode-file://vscode-app${videoPath}`;
    if (video.src !== videoUrl) {
      video.src = videoUrl;
      video.play().catch(() => {});
      Logger.debug(`Video source updated: ${videoPath}`);
    }
  }

  async changeVideoWithFade(videoPath: string, durationMs = 300): Promise<void> {
    const video = this.getVideoElement();
    const container = this.getVideoContainer();
    if (!video || !container) return;

    const videoUrl = `vscode-file://vscode-app${videoPath}`;
    if (video.src === videoUrl) return;

    await this.fadeOut(durationMs);
    video.src = videoUrl;
    video.play().catch(() => {});
    this.fadeIn(durationMs);
  }

  removeVideoElement(): void {
    const box = document.getElementById('tvb-video-box');
    if (box) {
      box.remove();
      Logger.debug('Video container removed');
    }

    const css = document.getElementById('tvb-style');
    if (css) {
      css.remove();
    }
  }

  isVideoPlaying(): boolean {
    const video = this.getVideoElement();
    return video ? !video.paused : false;
  }

  getVideoElement(): HTMLVideoElement | null {
    return document.getElementById('tvb-vid') as HTMLVideoElement | null;
  }

  getVideoContainer(): HTMLElement | null {
    return document.getElementById('tvb-video-box');
  }

  async setBrightness(value: number): Promise<void> {
    const video = this.getVideoElement();
    if (!video) return;

    const currentFilter = video.style.filter || '';
    const newFilter = currentFilter.replace(/brightness\([^)]*\)/, `brightness(${value}%)`);
    video.style.filter = newFilter;
  }

  async setOpacity(value: number): Promise<void> {
    const video = this.getVideoElement();
    if (!video) return;

    video.style.opacity = String(value);
  }

  fadeIn(durationMs: number = 300): void {
    const container = this.getVideoContainer();
    if (!container) return;

    container.style.transition = `opacity ${durationMs}ms ease`;
    container.style.opacity = '0';

    requestAnimationFrame(() => {
      container.style.opacity = '1';
    });
  }

  fadeOut(durationMs: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const container = this.getVideoContainer();
      if (!container) {
        resolve();
        return;
      }

      container.style.transition = `opacity ${durationMs}ms ease`;
      container.style.opacity = '0';

      const onEnd = () => {
        container.removeEventListener('transitionend', onEnd);
        resolve();
      };

      container.addEventListener('transitionend', onEnd);

      setTimeout(() => {
        resolve();
      }, durationMs + 50);
    });
  }

  dispose(): void {
    this.removeVideoElement();
    if (this.focusDisposable) {
      this.focusDisposable.dispose();
      this.focusDisposable = null;
    }
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
