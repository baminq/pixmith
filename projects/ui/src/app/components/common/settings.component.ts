import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingsService, CustomAPIConfig } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  selectedLanguage = signal('en');

  customImageName = signal('');
  customImageBaseUrl = signal('');
  customImageApiKey = signal('');
  customImageModel = signal('');
  showCustomImageApiKey = signal(false);
  customImageExpanded = signal(true);

  customMusicName = signal('');
  customMusicBaseUrl = signal('');
  customMusicApiKey = signal('');
  customMusicModel = signal('');
  showCustomMusicApiKey = signal(false);
  customMusicExpanded = signal(false);

  customVideoName = signal('');
  customVideoBaseUrl = signal('');
  customVideoApiKey = signal('');
  customVideoModel = signal('');
  showCustomVideoApiKey = signal(false);
  customVideoExpanded = signal(false);

  constructor(
    public settingsService: SettingsService,
    private translationService: TranslationService,
  ) {
    this.selectedLanguage.set(this.settingsService.getLanguage());
    this.loadCustomFormData('image');
    this.loadCustomFormData('music');
    this.loadCustomFormData('video');
  }

  private loadCustomFormData(type: 'image' | 'music' | 'video') {
    const config = this.settingsService.getCustomConfigForType(type);
    switch (type) {
      case 'image':
        this.customImageName.set(config.name);
        this.customImageBaseUrl.set(config.baseUrl);
        this.customImageApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
        this.customImageModel.set(config.model);
        break;
      case 'music':
        this.customMusicName.set(config.name);
        this.customMusicBaseUrl.set(config.baseUrl);
        this.customMusicApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
        this.customMusicModel.set(config.model);
        break;
      case 'video':
        this.customVideoName.set(config.name);
        this.customVideoBaseUrl.set(config.baseUrl);
        this.customVideoApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
        this.customVideoModel.set(config.model);
        break;
    }
  }

  toggleCustomImageApiKeyVisibility(): void {
    this.showCustomImageApiKey.update((show) => !show);
    if (this.showCustomImageApiKey()) {
      this.customImageApiKey.set(this.settingsService.getCustomImageConfig().apiKey);
    } else {
      this.customImageApiKey.set(
        this.settingsService.getMaskedKey(this.settingsService.getCustomImageConfig().apiKey),
      );
    }
  }

  toggleCustomMusicApiKeyVisibility(): void {
    this.showCustomMusicApiKey.update((show) => !show);
    if (this.showCustomMusicApiKey()) {
      this.customMusicApiKey.set(this.settingsService.getCustomMusicConfig().apiKey);
    } else {
      this.customMusicApiKey.set(
        this.settingsService.getMaskedKey(this.settingsService.getCustomMusicConfig().apiKey),
      );
    }
  }

  toggleCustomVideoApiKeyVisibility(): void {
    this.showCustomVideoApiKey.update((show) => !show);
    if (this.showCustomVideoApiKey()) {
      this.customVideoApiKey.set(this.settingsService.getCustomVideoConfig().apiKey);
    } else {
      this.customVideoApiKey.set(
        this.settingsService.getMaskedKey(this.settingsService.getCustomVideoConfig().apiKey),
      );
    }
  }

  saveCustomImageConfig(): void {
    const config: CustomAPIConfig = {
      name: this.customImageName(),
      baseUrl: this.customImageBaseUrl(),
      apiKey: this.getRawCustomApiKey('image'),
      model: this.customImageModel(),
    };
    this.settingsService.setCustomImageConfig(config);
    this.customImageApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
    this.showCustomImageApiKey.set(false);
  }

  saveCustomMusicConfig(): void {
    const config: CustomAPIConfig = {
      name: this.customMusicName(),
      baseUrl: this.customMusicBaseUrl(),
      apiKey: this.getRawCustomApiKey('music'),
      model: this.customMusicModel(),
    };
    this.settingsService.setCustomMusicConfig(config);
    this.customMusicApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
    this.showCustomMusicApiKey.set(false);
  }

  saveCustomVideoConfig(): void {
    const config: CustomAPIConfig = {
      name: this.customVideoName(),
      baseUrl: this.customVideoBaseUrl(),
      apiKey: this.getRawCustomApiKey('video'),
      model: this.customVideoModel(),
    };
    this.settingsService.setCustomVideoConfig(config);
    this.customVideoApiKey.set(this.settingsService.getMaskedKey(config.apiKey));
    this.showCustomVideoApiKey.set(false);
  }

  clearCustomImageConfig(): void {
    this.settingsService.clearCustomImageConfig();
    this.loadCustomFormData('image');
    this.customImageApiKey.set('');
  }

  clearCustomMusicConfig(): void {
    this.settingsService.clearCustomMusicConfig();
    this.loadCustomFormData('music');
    this.customMusicApiKey.set('');
  }

  clearCustomVideoConfig(): void {
    this.settingsService.clearCustomVideoConfig();
    this.loadCustomFormData('video');
    this.customVideoApiKey.set('');
  }

  private getRawCustomApiKey(type: 'image' | 'music' | 'video'): string {
    const shown =
      type === 'image'
        ? this.showCustomImageApiKey()
        : type === 'music'
          ? this.showCustomMusicApiKey()
          : this.showCustomVideoApiKey();
    const input =
      type === 'image'
        ? this.customImageApiKey()
        : type === 'music'
          ? this.customMusicApiKey()
          : this.customVideoApiKey();
    const stored = this.settingsService.getCustomConfigForType(type).apiKey;

    if (shown) {
      return input;
    }
    if (input && !input.includes('*')) {
      return input;
    }
    return stored || input;
  }

  hasCustomApiConfig(type: 'image' | 'music' | 'video'): boolean {
    return this.settingsService.isCustomConfigured(type);
  }

  isCustomApiConfigured(): boolean {
    return this.settingsService.isCustomConfigured();
  }

  getAvailableLanguages() {
    return this.translationService.getAvailableLanguages();
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage.set(language);
    this.settingsService.setLanguage(language);
    this.translationService.setLanguage(language);
  }
}
