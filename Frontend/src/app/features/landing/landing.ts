import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';

interface FeaturedTemplate {
  id: number;
  title: string;
  category: string;
  badge: string;
  imageUrl: string;
  accentColor: string;
  description: string;
}

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly translationService = inject(TranslationService);

  public readonly isScrolled = signal<boolean>(false);

  public readonly steps = signal<StepItem[]>([
    {
      num: '01',
      title: 'Détails de l\'événement',
      desc: 'Titre, date, heure et salle ou ville de votre fête.',
      icon: 'fa-calendar-check'
    },
    {
      num: '02',
      title: 'Choix du modèle',
      desc: 'Design marocain raffiné avec musique et RSVP.',
      icon: 'fa-wand-magic-sparkles'
    },
    {
      num: '03',
      title: 'Partage WhatsApp',
      desc: 'Envoi instantané et suivi des réponses en direct.',
      icon: 'fa-paper-plane'
    }
  ]);

  public readonly featuredTemplates = signal<FeaturedTemplate[]>([
    {
      id: 2,
      title: 'Launch Party Royal',
      category: 'Soirée de Gala & Corporate',
      badge: 'Tendance 2026',
      imageUrl: '/assets/media/templates/launch-party-royal.jpg',
      accentColor: '#d4af37',
      description: 'Luxe nocturne aux tons noirs profonds et détails dorés, idéal pour les soirées de prestige.'
    },
    {
      id: 1,
      title: 'Fleurs de Coton',
      category: 'Mariage & Célébration',
      badge: 'Le Plus Populaire',
      imageUrl: '/assets/media/templates/fleurs-de-coton.jpg',
      accentColor: '#c5a85c',
      description: 'Douceur florale et romantisme épuré, parfait pour un mariage élégant et inoubliable.'
    },
    {
      id: 3,
      title: 'Or & Velours',
      category: 'Prestige Traditionnel',
      badge: 'Henné & Mariage',
      imageUrl: '/assets/media/templates/or-et-velours.jpg',
      accentColor: '#eab308',
      description: 'Arabesques marocaines et finitions dorées pour honorer vos traditions avec magnificence.'
    },
    {
      id: 4,
      title: 'Bohème Chic',
      category: 'Fiançailles & Réception',
      badge: 'Moderne',
      imageUrl: '/assets/media/templates/boheme-chic.jpg',
      accentColor: '#c27ba0',
      description: 'Tons poudrés chaleureux et typographie raffinée pour vos moments conviviaux en famille.'
    }
  ]);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 30);
      });
    }
  }

  public scrollToSection(elementId: string): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  public switchLanguage(lang: 'fr' | 'ar' | 'en'): void {
    this.translationService.setLanguage(lang);
  }

  public isCurrentLang(lang: string): boolean {
    return this.translationService.currentLang() === lang;
  }
}
