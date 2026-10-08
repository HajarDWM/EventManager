import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { MainCategoryInfo, TEMPLATE_TAXONOMY, getCategoryTaxonomy, getAllSubcategoriesForCategory } from '../constants/template-taxonomy.constants';

export interface DigitalTemplate {
  id?: number;
  title: string;
  category: string;
  subCategory?: string;
  description?: string;
  imageUrl?: string;
  templateKey?: string;
  decorativeFrame?: string; // floral-frame, gold-border, geometric-frame, minimal-edge
  accentColor?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string | null;
  backgroundImageDesktopUrl?: string | null;
  primaryFont?: string; // Playfair Display, Cormorant Garamond, Montserrat, Great Vibes, Cinzel, Alex Brush
  primaryFontSize?: string;
  primaryFontWeight?: string | null;
  primaryLetterSpacing?: string | null;
  secondaryFont?: string;
  secondaryFontSize?: string;
  secondaryFontWeight?: string | null;
  secondaryLetterSpacing?: string | null;
  secondaryFontColor?: string;
  musicUrl?: string | null;
  htmlContent?: string;
  openingAnimation?: string | null;
  visualParticles?: string | null;
  backgroundMotion?: string | null;
  contentEntrance?: string | null;
  showCountdown?: boolean | null;
  showCalendarButton?: boolean | null;
  showMapRoute?: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/templates';
  private readonly sharedUrl = '/api/templates';
  private readonly STORAGE_KEY_CUSTOM_CATEGORIES = 'custom_template_categories';
  private readonly STORAGE_KEY_TEMPLATES_SESSION = 'event_manager_templates_session';

  public readonly templates = signal<DigitalTemplate[]>(this.loadInitialTemplates());
  public readonly isLoaded = signal<boolean>(this.loadInitialTemplates().length > 0);

  private cachedTemplates$: Observable<DigitalTemplate[]> | null = null;

  // Reactive Categories Signal (Built-in + Admin Custom Categories)
  public readonly categories = signal<MainCategoryInfo[]>(this.loadInitialCategories());

  private loadInitialTemplates(): DigitalTemplate[] {
    if (typeof window === 'undefined' || !window.sessionStorage) return [];
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY_TEMPLATES_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore session storage errors
    }
    return [];
  }

  private saveTemplatesToSession(templates: DigitalTemplate[]): void {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
      sessionStorage.setItem(this.STORAGE_KEY_TEMPLATES_SESSION, JSON.stringify(templates));
    } catch {
      // Safe fallback if quota is exceeded
    }
  }

  private loadInitialCategories(): MainCategoryInfo[] {
    const list: MainCategoryInfo[] = [...TEMPLATE_TAXONOMY];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_CUSTOM_CATEGORIES);
      if (stored) {
        const parsed: MainCategoryInfo[] = JSON.parse(stored);
        parsed.forEach(c => {
          const index = list.findIndex(item => item.id === c.id);
          if (index > -1) {
            list[index] = c;
          } else {
            list.push(c);
          }
        });
      }
    } catch (e) {
      console.warn('Erreur lors du chargement des catégories personnalisées', e);
    }
    return list;
  }

  private saveCustomCategories(categories: MainCategoryInfo[]): void {
    // Only persist categories that differ from or extend the built-in defaults
    const customOnly = categories.filter(c => !TEMPLATE_TAXONOMY.some(t => t.id === c.id) || 
      JSON.stringify(c) !== JSON.stringify(TEMPLATE_TAXONOMY.find(t => t.id === c.id)));
    localStorage.setItem(this.STORAGE_KEY_CUSTOM_CATEGORIES, JSON.stringify(customOnly));
    this.categories.set([...categories]);
  }

  public addCategory(cat: MainCategoryInfo): void {
    const current = this.categories();
    const updated = [...current, cat];
    this.saveCustomCategories(updated);
  }

  public updateCategory(id: string, updatedCat: MainCategoryInfo): void {
    const current = this.categories();
    const index = current.findIndex(c => c.id === id);
    if (index > -1) {
      const copy = [...current];
      copy[index] = updatedCat;
      this.saveCustomCategories(copy);
    }
  }

  public deleteCategory(id: string): void {
    const current = this.categories();
    const filtered = current.filter(c => c.id !== id);
    this.saveCustomCategories(filtered);
  }

  public getTemplates(forceRefresh = false): Observable<DigitalTemplate[]> {
    if (!this.cachedTemplates$ || forceRefresh) {
      this.cachedTemplates$ = this.http.get<DigitalTemplate[]>(this.sharedUrl).pipe(
        tap(data => {
          if (data) {
            this.templates.set(data);
            this.isLoaded.set(true);
            this.saveTemplatesToSession(data);
          }
        }),
        shareReplay(1)
      );
    }
    return this.cachedTemplates$;
  }

  public preloadTemplates(): void {
    this.getTemplates().subscribe();
  }

  public clearCache(): void {
    this.cachedTemplates$ = null;
  }

  public createTemplate(template: DigitalTemplate): Observable<DigitalTemplate> {
    return this.http.post<DigitalTemplate>(this.apiUrl, template).pipe(
      tap(created => {
        if (created) {
          this.templates.update(list => {
            const updated = [...list, created];
            this.saveTemplatesToSession(updated);
            return updated;
          });
        }
        this.clearCache();
      })
    );
  }

  public updateTemplate(id: number, template: DigitalTemplate): Observable<DigitalTemplate> {
    return this.http.put<DigitalTemplate>(`${this.apiUrl}/${id}`, template).pipe(
      tap(updated => {
        if (updated) {
          this.templates.update(list => {
            const newList = list.map(t => t.id === updated.id ? { ...t, ...updated } : t);
            this.saveTemplatesToSession(newList);
            return newList;
          });
        }
        this.clearCache();
      })
    );
  }

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.templates.update(list => {
          const filtered = list.filter(t => t.id !== id);
          this.saveTemplatesToSession(filtered);
          return filtered;
        });
        this.clearCache();
      })
    );
  }
}
