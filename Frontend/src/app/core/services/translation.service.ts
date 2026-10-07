import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);

  // Active language signal initialized from localStorage or browser default
  private readonly initialLang: SupportedLanguage = (localStorage.getItem('app_lang') as SupportedLanguage) || 'fr';
  public readonly currentLang = signal<SupportedLanguage>(this.initialLang);

  // Dictionary signal holding current language key-value pairs
  private readonly translationsMap = signal<Record<string, any>>({});
  public readonly isLoaded = signal<boolean>(false);

  constructor() {
    this.loadLanguage(this.initialLang).subscribe();
  }

  /**
   * Loads language JSON file and updates translationsMap
   */
  public loadLanguage(lang: SupportedLanguage): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).pipe(
      tap((data) => {
        this.translationsMap.set(data);
        this.currentLang.set(lang);
        this.isLoaded.set(true);
        localStorage.setItem('app_lang', lang);
        document.documentElement.lang = lang;
      }),
      catchError((err) => {
        console.error(`Failed to load translation file for ${lang}`, err);
        return of({});
      })
    );
  }

  /**
   * Change current application language
   */
  public setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() === lang && this.isLoaded()) return;
    this.loadLanguage(lang).subscribe();
  }

  /**
   * Translate a key (e.g. "NAV.DASHBOARD" or "GUESTS.TITLE")
   */
  public translate(key: string, params?: Record<string, any>): string {
    if (!key) return '';
    const dict = this.translationsMap();
    if (!dict || Object.keys(dict).length === 0) {
      return key;
    }

    const keys = key.split('.');
    let value: any = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace dynamic parameters e.g. {count}
    if (params) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      }, value);
    }

    return value;
  }
}
