import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

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
  private cachedTemplates$: Observable<DigitalTemplate[]> | null = null;

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
