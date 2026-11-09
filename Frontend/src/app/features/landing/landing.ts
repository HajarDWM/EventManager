import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { TranslationService, SupportedLanguage } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface FeaturedTemplate {
  id: number;
  titleKey: string;
  categoryKey: string;
  badgeKey: string;
  imageUrl: string;
  accentColor: string;
  descKey: string;
}

interface StepItem {
  num: string;
  titleKey: string;
  descKey: string;
  icon: string;
}

interface LangOption {
  code: SupportedLanguage;
  label: string;
  short: string;
  flag: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly translationService = inject(TranslationService);

  public readonly isScrolled = signal<boolean>(false);
  public readonly isLangDropdownOpen = signal<boolean>(false);

  public readonly languages: LangOption[] = [
    { code: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', short: 'AR', flag: '🇲🇦' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' }
  ];

  public get currentLanguage(): LangOption {
    const active = this.translationService.currentLang();
    return this.languages.find(l => l.code === active) || this.languages[0];
  }

  public readonly steps = signal<StepItem[]>([
    {
      num: '01',
      titleKey: 'LANDING.STEPS.STEP_1_TITLE',
      descKey: 'LANDING.STEPS.STEP_1_DESC',
      icon: 'fa-calendar-check'
    },
    {
      num: '02',
      titleKey: 'LANDING.STEPS.STEP_2_TITLE',
      descKey: 'LANDING.STEPS.STEP_2_DESC',
      icon: 'fa-wand-magic-sparkles'
    },
    {
      num: '03',
      titleKey: 'LANDING.STEPS.STEP_3_TITLE',
      descKey: 'LANDING.STEPS.STEP_3_DESC',
      icon: 'fa-paper-plane'
    }
  ]);

  public readonly featuredTemplates = signal<FeaturedTemplate[]>([
    {
      id: 2,
      titleKey: 'LANDING.TEMPLATES.CARD_1_TITLE',
      categoryKey: 'LANDING.TEMPLATES.CARD_1_CATEGORY',
      badgeKey: 'LANDING.TEMPLATES.CARD_1_BADGE',
      imageUrl: '/assets/images/templates/launch-party-royal.jpg',
      accentColor: '#d4af37',
      descKey: 'LANDING.TEMPLATES.CARD_1_DESC'
    },
    {
      id: 1,
      titleKey: 'LANDING.TEMPLATES.CARD_2_TITLE',
      categoryKey: 'LANDING.TEMPLATES.CARD_2_CATEGORY',
      badgeKey: 'LANDING.TEMPLATES.CARD_2_BADGE',
      imageUrl: '/assets/images/templates/fleurs-de-coton.jpg',
      accentColor: '#c5a85c',
      descKey: 'LANDING.TEMPLATES.CARD_2_DESC'
    },
    {
      id: 3,
      titleKey: 'LANDING.TEMPLATES.CARD_3_TITLE',
      categoryKey: 'LANDING.TEMPLATES.CARD_3_CATEGORY',
      badgeKey: 'LANDING.TEMPLATES.CARD_3_BADGE',
      imageUrl: '/assets/images/templates/celebration-henne.png',
      accentColor: '#eab308',
      descKey: 'LANDING.TEMPLATES.CARD_3_DESC'
    }
  ]);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 30);
      });
    }
  }

  public toggleLangDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLangDropdownOpen.update(v => !v);
  }

  public selectLanguage(code: SupportedLanguage, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.translationService.setLanguage(code);
    this.isLangDropdownOpen.set(false);
  }

  @HostListener('document:click')
  public onDocumentClick(): void {
    this.isLangDropdownOpen.set(false);
  }

  public scrollToSection(elementId: string): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  public scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
