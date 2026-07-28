import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DigitalTemplate {
  id?: number;
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
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

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
