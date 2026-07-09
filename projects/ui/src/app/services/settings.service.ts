import { Injectable, signal, WritableSignal } from '@angular/core';

export interface CustomAPIConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const DEFAULT_CUSTOM_IMAGE_CONFIG: CustomAPIConfig = {
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'dall-e-3',
};

const DEFAULT_CUSTOM_MUSIC_CONFIG: CustomAPIConfig = {
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
};

const DEFAULT_CUSTOM_VIDEO_CONFIG: CustomAPIConfig = {
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: '',
};

/** Only OpenAI-compatible custom APIs are exposed in the UI. */
export const ACTIVE_MODEL = 'custom';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly LANGUAGE_STORAGE_KEY = 'pixelda_language';

  private readonly CUSTOM_IMAGE_CONFIG_KEY = 'pixelda_custom_image_config';
  private readonly CUSTOM_MUSIC_CONFIG_KEY = 'pixelda_custom_music_config';
  private readonly CUSTOM_VIDEO_CONFIG_KEY = 'pixelda_custom_video_config';

  private languageSignal = signal<string>('en');

  private customImageConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_IMAGE_CONFIG });
  private customMusicConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_MUSIC_CONFIG });
  private customVideoConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_VIDEO_CONFIG });

  constructor() {
    const storedLanguage = localStorage.getItem(this.LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      this.languageSignal.set(storedLanguage);
    }

    this.loadCustomConfig(
      this.CUSTOM_IMAGE_CONFIG_KEY,
      this.customImageConfigSignal,
      DEFAULT_CUSTOM_IMAGE_CONFIG,
    );
    this.loadCustomConfig(
      this.CUSTOM_MUSIC_CONFIG_KEY,
      this.customMusicConfigSignal,
      DEFAULT_CUSTOM_MUSIC_CONFIG,
    );
    this.loadCustomConfig(
      this.CUSTOM_VIDEO_CONFIG_KEY,
      this.customVideoConfigSignal,
      DEFAULT_CUSTOM_VIDEO_CONFIG,
    );

    // Force custom as the only active provider (migrate away from tongyi/doubao).
    localStorage.setItem('pixelda_active_api_key', ACTIVE_MODEL);
  }

  private loadCustomConfig(
    storageKey: string,
    signal: WritableSignal<CustomAPIConfig>,
    defaults: CustomAPIConfig,
  ) {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        signal.set({ ...defaults, ...parsed });
      } catch {
        signal.set({ ...defaults });
      }
    }
  }

  readonly language = this.languageSignal.asReadonly();
  readonly customImageConfig = this.customImageConfigSignal.asReadonly();
  readonly customMusicConfig = this.customMusicConfigSignal.asReadonly();
  readonly customVideoConfig = this.customVideoConfigSignal.asReadonly();

  /** Always custom — Chinese providers are hidden. */
  getActiveModel(): string {
    return ACTIVE_MODEL;
  }

  hasAnyApiKey(): boolean {
    return (
      !!this.customImageConfigSignal().apiKey ||
      !!this.customMusicConfigSignal().apiKey ||
      !!this.customVideoConfigSignal().apiKey
    );
  }

  isCustomConfigured(type?: 'image' | 'music' | 'video'): boolean {
    if (type) {
      const config = this.getCustomConfigForType(type);
      return !!(config.baseUrl && config.apiKey);
    }
    return (
      this.isCustomConfigured('image') ||
      this.isCustomConfigured('music') ||
      this.isCustomConfigured('video')
    );
  }

  setLanguage(language: string): void {
    this.languageSignal.set(language);
    localStorage.setItem(this.LANGUAGE_STORAGE_KEY, language);
  }

  getLanguage(): string {
    return this.languageSignal();
  }

  setCustomImageConfig(config: CustomAPIConfig): void {
    this.customImageConfigSignal.set(config);
    localStorage.setItem(this.CUSTOM_IMAGE_CONFIG_KEY, JSON.stringify(config));
  }

  setCustomMusicConfig(config: CustomAPIConfig): void {
    this.customMusicConfigSignal.set(config);
    localStorage.setItem(this.CUSTOM_MUSIC_CONFIG_KEY, JSON.stringify(config));
  }

  setCustomVideoConfig(config: CustomAPIConfig): void {
    this.customVideoConfigSignal.set(config);
    localStorage.setItem(this.CUSTOM_VIDEO_CONFIG_KEY, JSON.stringify(config));
  }

  getCustomImageConfig(): CustomAPIConfig {
    return this.customImageConfigSignal();
  }

  getCustomMusicConfig(): CustomAPIConfig {
    return this.customMusicConfigSignal();
  }

  getCustomVideoConfig(): CustomAPIConfig {
    return this.customVideoConfigSignal();
  }

  getCustomConfigForType(type: 'image' | 'music' | 'video'): CustomAPIConfig {
    if (type === 'music') return this.getCustomMusicConfig();
    if (type === 'video') return this.getCustomVideoConfig();
    return this.getCustomImageConfig();
  }

  getMaskedKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(8);
    return key.substring(0, 4) + '*'.repeat(8) + key.substring(key.length - 4);
  }

  clearCustomImageConfig(): void {
    this.customImageConfigSignal.set({ ...DEFAULT_CUSTOM_IMAGE_CONFIG });
    localStorage.removeItem(this.CUSTOM_IMAGE_CONFIG_KEY);
  }

  clearCustomMusicConfig(): void {
    this.customMusicConfigSignal.set({ ...DEFAULT_CUSTOM_MUSIC_CONFIG });
    localStorage.removeItem(this.CUSTOM_MUSIC_CONFIG_KEY);
  }

  clearCustomVideoConfig(): void {
    this.customVideoConfigSignal.set({ ...DEFAULT_CUSTOM_VIDEO_CONFIG });
    localStorage.removeItem(this.CUSTOM_VIDEO_CONFIG_KEY);
  }
}
