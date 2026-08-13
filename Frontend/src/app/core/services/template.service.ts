import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DigitalTemplate {
  id?: number;
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  templateKey?: string;
  decorativeFrame?: string; // floral-frame, gold-border, geometric-frame, minimal-edge
  accentColor?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  primaryFont?: string; // Playfair Display, Cormorant Garamond, Montserrat, Great Vibes, Cinzel, Alex Brush
  primaryFontSize?: string;
  secondaryFont?: string;
  secondaryFontSize?: string;
  secondaryFontColor?: string;
  musicUrl?: string;
  htmlContent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/templates';
  private readonly sharedUrl = '/api/templates';

  public getTemplates(): Observable<DigitalTemplate[]> {
    return this.http.get<DigitalTemplate[]>(this.sharedUrl);
  }

  public createTemplate(template: DigitalTemplate): Observable<DigitalTemplate> {
    return this.http.post<DigitalTemplate>(this.apiUrl, template);
  }

  public updateTemplate(id: number, template: DigitalTemplate): Observable<DigitalTemplate> {
    return this.http.put<DigitalTemplate>(`${this.apiUrl}/${id}`, template);
  }

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
