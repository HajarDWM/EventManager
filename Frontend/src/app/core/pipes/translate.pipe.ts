import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pure: false enables instant reactive template updates when language signal changes
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  public transform(key: string, params?: Record<string, any>): string {
    return this.translationService.translate(key, params);
  }
}
