import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrls: ['./language-switcher.scss']
})
export class LanguageSwitcher {
  protected readonly translationService = inject(TranslationService);
  protected readonly isOpen = signal<boolean>(false);

  protected readonly languages: { code: SupportedLanguage; label: string; short: string; flag: string }[] = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷' }
  ];

  protected get currentLanguageShort(): string {
    const active = this.translationService.currentLang();
    return active.toUpperCase();
  }

  protected toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  protected selectLanguage(code: SupportedLanguage, event: MouseEvent): void {
    event.stopPropagation();
    this.translationService.setLanguage(code);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    this.isOpen.set(false);
  }
}
