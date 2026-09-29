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

  private cachedTemplates$: Observable<DigitalTemplate[]> | null = null;

  // Reactive Categories Signal (Built-in + Admin Custom Categories)
  public readonly categories = signal<MainCategoryInfo[]>(this.loadInitialCategories());

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
      tap(() => this.clearCache())
    );
  }

  public updateTemplate(id: number, template: DigitalTemplate): Observable<DigitalTemplate> {
    return this.http.put<DigitalTemplate>(`${this.apiUrl}/${id}`, template).pipe(
      tap(() => this.clearCache())
    );
  }

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }
}
