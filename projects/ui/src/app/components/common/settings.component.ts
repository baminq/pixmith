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
  tongyiApiKeyInput = signal('');
  doubaoApiKeyInput = signal('');
  showTongyiApiKey = signal(false);
  showDoubaoApiKey = signal(false);
  activeApiKey = signal('tongyi');
  selectedLanguage = signal('en');

  // Custom API form fields
  customImageName = signal('');
  customImageBaseUrl = signal('');
  customImageApiKey = signal('');
  customImageModel = signal('');
  showCustomImageApiKey = signal(false);
  customImageExpanded = signal(false);

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
    this.tongyiApiKeyInput.set(this.settingsService.getMaskedTongyiApiKey());
    this.doubaoApiKeyInput.set(this.settingsService.getMaskedDoubaoApiKey());
    this.activeApiKey.set(this.settingsService.getActiveModel());
    this.selectedLanguage.set(this.settingsService.getLanguage());

    // Load custom API configs into form fields
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

  toggleTongyiApiKeyVisibility(): void {
    this.showTongyiApiKey.update((show) => !show);
    if (this.showTongyiApiKey()) {
      this.tongyiApiKeyInput.set(this.settingsService.getTongyiApiKey());
    } else {
      this.tongyiApiKeyInput.set(this.settingsService.getMaskedTongyiApiKey());
    }
  }

  toggleDoubaoApiKeyVisibility(): void {
    this.showDoubaoApiKey.update((show) => !show);
    if (this.showDoubaoApiKey()) {
      this.doubaoApiKeyInput.set(this.settingsService.getDoubaoApiKey());
    } else {
      this.doubaoApiKeyInput.set(this.settingsService.getMaskedDoubaoApiKey());
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

  saveApiKey(): void {
    const currentInput = this.tongyiApiKeyInput();

    let apiKeyToSave: string;

    if (this.showTongyiApiKey()) {
      apiKeyToSave = currentInput;
    } else {
      if (currentInput && !currentInput.includes('*')) {
        apiKeyToSave = currentInput;
      } else {
        apiKeyToSave = this.settingsService.getTongyiApiKey() || currentInput;
      }
    }

    if (apiKeyToSave && apiKeyToSave.trim()) {
      this.settingsService.setTongyiApiKey(apiKeyToSave.trim());
      this.tongyiApiKeyInput.set(this.settingsService.getMaskedTongyiApiKey());
      this.showTongyiApiKey.set(false);
    }
  }

  saveDoubaoApiKey(): void {
    const currentInput = this.doubaoApiKeyInput();

    let apiKeyToSave: string;

    if (this.showDoubaoApiKey()) {
      apiKeyToSave = currentInput;
    } else {
      if (currentInput && !currentInput.includes('*')) {
        apiKeyToSave = currentInput;
      } else {
        apiKeyToSave = this.settingsService.getDoubaoApiKey() || currentInput;
      }
    }

    if (apiKeyToSave && apiKeyToSave.trim()) {
      this.settingsService.setDoubaoApiKey(apiKeyToSave.trim());
      this.doubaoApiKeyInput.set(this.settingsService.getMaskedDoubaoApiKey());
      this.showDoubaoApiKey.set(false);
    }
  }

  clearTongyiApiKey(): void {
    this.settingsService.clearTongyiApiKey();
    this.tongyiApiKeyInput.set('');
    this.showTongyiApiKey.set(false);
  }

  clearDoubaoApiKey(): void {
    this.settingsService.clearDoubaoApiKey();
    this.doubaoApiKeyInput.set('');
    this.showDoubaoApiKey.set(false);
  }

  onApiKeyInputChange(value: string): void {
    this.tongyiApiKeyInput.set(value);
  }

  onDoubaoApiKeyInputChange(value: string): void {
    this.doubaoApiKeyInput.set(value);
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
    this.customImageApiKey.set('');
  }

  clearCustomMusicConfig(): void {
    this.settingsService.clearCustomMusicConfig();
    this.customMusicApiKey.set('');
  }

  clearCustomVideoConfig(): void {
    this.settingsService.clearCustomVideoConfig();
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
    const config = this.settingsService.getCustomConfigForType(type);
    return !!(config.baseUrl && config.apiKey);
  }

  isCustomApiConfigured(): boolean {
    return (
      this.hasCustomApiConfig('image') ||
      this.hasCustomApiConfig('music') ||
      this.hasCustomApiConfig('video')
    );
  }

  setActiveApiKey(type: string): void {
    this.activeApiKey.set(type);
    this.settingsService.setActiveApiKey(type);
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
