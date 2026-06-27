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
  name: 'Luma',
  baseUrl: 'https://api.lumalabs.ai',
  apiKey: '',
  model: '',
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly API_KEY_TONGYI_STORAGE_KEY = 'pixelda_tongyi_api_key';
  private readonly API_KEY_DOUBAO_STORAGE_KEY = 'pixelda_doubao_api_key';
  private readonly ACTIVE_API_KEY_STORAGE_KEY = 'pixelda_active_api_key';
  private readonly LANGUAGE_STORAGE_KEY = 'pixelda_language';

  private readonly CUSTOM_IMAGE_CONFIG_KEY = 'pixelda_custom_image_config';
  private readonly CUSTOM_MUSIC_CONFIG_KEY = 'pixelda_custom_music_config';
  private readonly CUSTOM_VIDEO_CONFIG_KEY = 'pixelda_custom_video_config';

  private tongyiApiKeySignal = signal<string>('');
  private doubaoApiKeySignal = signal<string>('');
  private activeModel = signal<string>('tongyi');
  private languageSignal = signal<string>('en');

  // Custom API configs
  private customImageConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_IMAGE_CONFIG });
  private customMusicConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_MUSIC_CONFIG });
  private customVideoConfigSignal = signal<CustomAPIConfig>({ ...DEFAULT_CUSTOM_VIDEO_CONFIG });

  constructor() {
    const storedKey = localStorage.getItem(this.API_KEY_TONGYI_STORAGE_KEY);
    if (storedKey) {
      this.tongyiApiKeySignal.set(storedKey);
    }
    const storedDoubaoKey = localStorage.getItem(this.API_KEY_DOUBAO_STORAGE_KEY);
    if (storedDoubaoKey) {
      this.doubaoApiKeySignal.set(storedDoubaoKey);
    }
    const storedActive = localStorage.getItem(this.ACTIVE_API_KEY_STORAGE_KEY);
    if (storedActive) {
      this.activeModel.set(storedActive);
    }
    const storedLanguage = localStorage.getItem(this.LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      this.languageSignal.set(storedLanguage);
    }

    // Load custom API configs
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

  readonly tongyiApiKey = this.tongyiApiKeySignal.asReadonly();
  readonly doubaoApiKey = this.doubaoApiKeySignal.asReadonly();
  readonly activeApiKey = this.activeModel.asReadonly();
  readonly language = this.languageSignal.asReadonly();

  readonly customImageConfig = this.customImageConfigSignal.asReadonly();
  readonly customMusicConfig = this.customMusicConfigSignal.asReadonly();
  readonly customVideoConfig = this.customVideoConfigSignal.asReadonly();

  setTongyiApiKey(apiKey: string): void {
    this.tongyiApiKeySignal.set(apiKey);
    localStorage.setItem(this.API_KEY_TONGYI_STORAGE_KEY, apiKey);
  }

  setDoubaoApiKey(apiKey: string): void {
    this.doubaoApiKeySignal.set(apiKey);
    localStorage.setItem(this.API_KEY_DOUBAO_STORAGE_KEY, apiKey);
  }

  getTongyiApiKey(): string {
    return this.tongyiApiKeySignal();
  }

  getDoubaoApiKey(): string {
    return this.doubaoApiKeySignal();
  }

  setActiveApiKey(type: string): void {
    this.activeModel.set(type);
    localStorage.setItem(this.ACTIVE_API_KEY_STORAGE_KEY, type);
  }

  getActiveModel(): string {
    return this.activeModel();
  }

  getCurrentActiveApiKey(): string {
    const active = this.activeModel();
    if (active === 'doubao') {
      return this.doubaoApiKeySignal();
    } else if (active === 'custom') {
      return this.customImageConfigSignal().apiKey;
    }
    return this.tongyiApiKeySignal();
  }

  clearTongyiApiKey(): void {
    this.tongyiApiKeySignal.set('');
    localStorage.removeItem(this.API_KEY_TONGYI_STORAGE_KEY);
  }

  clearDoubaoApiKey(): void {
    this.doubaoApiKeySignal.set('');
    localStorage.removeItem(this.API_KEY_DOUBAO_STORAGE_KEY);
  }

  hasTongyiApiKey(): boolean {
    return this.tongyiApiKeySignal().length > 0;
  }

  hasDoubaoApiKey(): boolean {
    return this.doubaoApiKeySignal().length > 0;
  }

  hasAnyApiKey(): boolean {
    return (
      this.hasTongyiApiKey() ||
      this.hasDoubaoApiKey() ||
      !!this.customImageConfigSignal().apiKey ||
      !!this.customMusicConfigSignal().apiKey ||
      !!this.customVideoConfigSignal().apiKey
    );
  }

  getMaskedTongyiApiKey(): string {
    const key = this.tongyiApiKeySignal();
    if (!key) return '';
    return '*'.repeat(12);
  }

  getMaskedDoubaoApiKey(): string {
    const key = this.doubaoApiKeySignal();
    if (!key) return '';
    return '*'.repeat(12);
  }

  setLanguage(language: string): void {
    this.languageSignal.set(language);
    localStorage.setItem(this.LANGUAGE_STORAGE_KEY, language);
  }

  getLanguage(): string {
    return this.languageSignal();
  }

  // Custom API config methods

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
