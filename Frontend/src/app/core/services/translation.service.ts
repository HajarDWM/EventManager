import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, tap, of, catchError, filter } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router, { optional: true });

  // Active language signal initialized from URL param, localStorage, or browser default
  private readonly initialLang: SupportedLanguage = this.detectInitialLanguage();
  public readonly currentLang = signal<SupportedLanguage>(this.initialLang);
  public readonly isRtl = computed(() => this.currentLang() === 'ar');

  // Dictionary signal holding current language key-value pairs
  private readonly translationsMap = signal<Record<string, any>>({});
  public readonly isLoaded = signal<boolean>(false);

  constructor() {
    this.loadLanguage(this.initialLang).subscribe();
    this.listenToRouteChanges();
  }

  /**
   * Checks whether the given or current route is a guest RSVP or preview route
   */
  public isRsvpRoute(customUrl?: string): boolean {
    if (typeof window === 'undefined') return false;
    const url = customUrl || (this.router?.url ?? window.location.pathname) || '';
    return url.startsWith('/rsvp') || url.includes('/rsvp/') || url.includes('template-preview');
  }

  /**
   * Retrieves the saved language for the Admin / Organizer interface ('fr' | 'en')
   */
  public getSavedAdminLanguage(): 'fr' | 'en' {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('admin_lang');
      if (saved === 'en' || saved === 'fr') {
        return saved;
      }
    }
    return 'fr';
  }

  /**
   * Listens to router navigation to ensure Admin / Organizer routes remain strictly LTR and FR/EN
   */
  private listenToRouteChanges(): void {
    if (!this.router) return;
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleRouteChange(event.urlAfterRedirects || event.url);
    });
  }

  private handleRouteChange(url: string): void {
    const isRsvp = this.isRsvpRoute(url);

    if (!isRsvp) {
      // In Admin / Organizer: Arabic is strictly forbidden! Interface must be 100% LTR
      if (typeof document !== 'undefined') {
        document.documentElement.dir = 'ltr';
      }
      if (this.currentLang() === 'ar') {
        const adminLang = this.getSavedAdminLanguage();
        this.loadLanguage(adminLang).subscribe();
      }
    } else {
      // In Guest RSVP: if language is Arabic, ensure RTL direction is active
      if (typeof document !== 'undefined') {
        document.documentElement.dir = this.currentLang() === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang();
      }
    }
  }

  /**
   * Intelligently detects initial language:
   * - On Guest RSVP: Supports AR, FR, EN
   * - On Admin / Organizer: Strictly restricted to FR and EN with clean LTR
   */
  private detectInitialLanguage(): SupportedLanguage {
    const isRsvp = this.isRsvpRoute();

    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang')?.toLowerCase();
        if (urlLang === 'en' || urlLang === 'fr') {
          return urlLang;
        }
        if (urlLang === 'ar' && isRsvp) {
          return 'ar';
        }
      }

      if (typeof localStorage !== 'undefined') {
        if (isRsvp) {
          const savedRsvp = localStorage.getItem('rsvp_lang') as SupportedLanguage;
          if (savedRsvp === 'en' || savedRsvp === 'fr' || savedRsvp === 'ar') {
            return savedRsvp;
          }
          const savedGeneral = localStorage.getItem('app_lang') as SupportedLanguage;
          if (savedGeneral === 'en' || savedGeneral === 'fr' || savedGeneral === 'ar') {
            return savedGeneral;
          }
        } else {
          const savedAdmin = localStorage.getItem('admin_lang') as SupportedLanguage;
          if (savedAdmin === 'en' || savedAdmin === 'fr') {
            return savedAdmin;
          }
        }
      }

      if (typeof navigator !== 'undefined') {
        const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
        if (isRsvp && browserLang.startsWith('ar')) {
          return 'ar';
        }
        if (browserLang.startsWith('en')) {
          return 'en';
        }
      }
    } catch (e) {
      console.warn('Error during language detection, falling back to fr', e);
    }
    return 'fr';
  }

  /**
   * Loads language JSON file and updates translationsMap
   */
  public loadLanguage(lang: SupportedLanguage): Observable<Record<string, any>> {
    const isRsvp = this.isRsvpRoute();
    let targetLang: SupportedLanguage = lang;

    // Disallow Arabic on non-RSVP routes (Organizer/Admin)
    if (!isRsvp && targetLang === 'ar') {
      targetLang = this.getSavedAdminLanguage();
    }

    return this.http.get<Record<string, any>>(`/assets/i18n/${targetLang}.json`).pipe(
      tap((data) => {
        this.translationsMap.set(data);
        this.currentLang.set(targetLang);
        this.isLoaded.set(true);

        if (typeof localStorage !== 'undefined') {
          if (isRsvp) {
            localStorage.setItem('rsvp_lang', targetLang);
          } else {
            localStorage.setItem('admin_lang', targetLang);
          }
          localStorage.setItem('app_lang', targetLang);
        }

        if (typeof document !== 'undefined') {
          document.documentElement.lang = targetLang;
          document.documentElement.dir = (isRsvp && targetLang === 'ar') ? 'rtl' : 'ltr';
        }
      }),
      catchError((err) => {
        console.error(`Failed to load translation file for ${targetLang}`, err);
        return of({});
      })
    );
  }

  /**
   * Change current application language
   */
  public setLanguage(lang: SupportedLanguage): void {
    const isRsvp = this.isRsvpRoute();
    let targetLang: SupportedLanguage = lang;

    if (!isRsvp && targetLang === 'ar') {
      targetLang = this.getSavedAdminLanguage();
    }

    if (this.currentLang() === targetLang && this.isLoaded()) {
      if (typeof document !== 'undefined') {
        document.documentElement.dir = (isRsvp && targetLang === 'ar') ? 'rtl' : 'ltr';
        document.documentElement.lang = targetLang;
      }
      return;
    }
    this.loadLanguage(targetLang).subscribe();
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

  /**
   * Alias for translate() for ngx-translate style syntax
   */
  public instant(key: string, params?: Record<string, any>): string {
    return this.translate(key, params);
  }
}
