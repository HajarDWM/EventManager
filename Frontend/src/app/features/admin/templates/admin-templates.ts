import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService, DigitalTemplate } from '../../../core/services/template.service';

@Component({
  selector: 'app-admin-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-templates.html',
  styleUrls: ['./admin-templates.scss']
})
export class AdminTemplates implements OnInit {
  private readonly templateService = inject(TemplateService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Category filter
  protected readonly activeCategoryFilter = signal<string>('ALL');

  protected readonly filteredTemplates = computed(() => {
    const filter = this.activeCategoryFilter();
    if (filter === 'ALL') {
      return this.templates();
    }
    return this.templates().filter(t => t.category.toUpperCase() === filter.toUpperCase());
  });

  // Modal & Form States
  protected readonly isModalOpen = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isSubmitting = signal(false);

  // Form Fields
  protected titleField = '';
  protected categoryField = 'Mariage';
  protected descriptionField = '';
  protected imageUrlField = '';
  protected backgroundImageUrlField = '';
  protected musicUrlField = '';
  protected templateKeyField = '';
  protected decorativeFrameField = 'floral-frame';
  protected accentColorField = '#d4af37';
  protected backgroundColorField = '#faf6ee';
  protected primaryFontField = 'Alex Brush';
  protected secondaryFontField = 'Cinzel';
  protected secondaryFontColorField = '#0f172a';
  protected htmlContentField = '';

  // Available Luxury Google Fonts with direct live style binding
  protected readonly availableFonts = [
    { name: 'Playfair Display', label: 'Playfair Display (Serif Luxueux & Éditorial)', fontGroup: 'Serif', sample: 'Mariage d\'Exception' },
    { name: 'Cormorant Garamond', label: 'Cormorant Garamond (Classique & Haute Joaillerie)', fontGroup: 'Serif', sample: 'Célébration Prestigieuse' },
    { name: 'Montserrat', label: 'Montserrat (Moderne & Sans-Serif Épuré)', fontGroup: 'Sans-Serif', sample: 'Conférence & Événement' },
    { name: 'Great Vibes', label: 'Great Vibes (Calligraphie Fluide & Romantique)', fontGroup: 'Cursive', sample: 'Yassine & Zineb' },
    { name: 'Cinzel', label: 'Cinzel (Impérial & Monumental)', fontGroup: 'Serif', sample: 'RÉCEPTION ROYALE' },
    { name: 'Alex Brush', label: 'Alex Brush (Script Délicat & Cérémonial)', fontGroup: 'Cursive', sample: 'Invitation Spéciale' }
  ];

  // Audio Preview & Presets
  protected readonly isPreviewAudioPlaying = signal(false);
  private previewAudioElement: HTMLAudioElement | null = null;
  protected readonly musicPresets = [
    { label: 'Mariage Marocain & Oud Calme', url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c3c3933c06.mp3' },
    { label: 'Romantique & Acoustique', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3' },
    { label: 'Andalou Traditionnel', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: 'Lounge & Jazz Élégant', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_33bd95d2c6.mp3' }
  ];

  public ngOnInit(): void {
    this.loadTemplates();
  }

  protected loadTemplates(): void {
    this.isLoading.set(true);
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Impossible de charger les modèles de faire-part.');
        this.isLoading.set(false);
      }
    });
  }

  protected setCategoryFilter(category: string): void {
    this.activeCategoryFilter.set(category);
  }

  protected onBackgroundFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) return;

        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            this.backgroundImageUrlField = canvas.toDataURL('image/jpeg', 0.88);
          } else {
            this.backgroundImageUrlField = rawResult;
          }
          this.cdr.markForCheck();
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeBackgroundImage(): void {
    this.backgroundImageUrlField = '';
  }

  protected onAudioFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (rawResult) {
          this.musicUrlField = rawResult;
          this.stopPreviewAudio();
          this.cdr.markForCheck();
        }
        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeMusic(): void {
    this.musicUrlField = '';
    this.stopPreviewAudio();
  }

  protected selectMusicPreset(url: string): void {
    this.musicUrlField = url;
    this.stopPreviewAudio();
  }

  protected togglePreviewAudio(): void {
    if (!this.musicUrlField?.trim()) return;

    if (this.isPreviewAudioPlaying()) {
      this.stopPreviewAudio();
    } else {
      if (!this.previewAudioElement) {
        this.previewAudioElement = new Audio();
        this.previewAudioElement.addEventListener('ended', () => {
          this.isPreviewAudioPlaying.set(false);
        });
        this.previewAudioElement.addEventListener('error', () => {
          this.isPreviewAudioPlaying.set(false);
        });
      }
      const targetSrc = this.musicUrlField.trim();
      if (this.previewAudioElement.src !== targetSrc) {
        this.previewAudioElement.src = targetSrc;
        this.previewAudioElement.load();
      }
      this.previewAudioElement.play()
        .then(() => this.isPreviewAudioPlaying.set(true))
        .catch(() => this.isPreviewAudioPlaying.set(false));
    }
  }

  protected stopPreviewAudio(): void {
    if (this.previewAudioElement) {
      try {
        this.previewAudioElement.pause();
        this.previewAudioElement.currentTime = 0;
      } catch (e) { }
    }
    this.isPreviewAudioPlaying.set(false);
  }

  protected openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.titleField = '';
    this.categoryField = 'Mariage';
    this.descriptionField = '';
    this.imageUrlField = '';
    this.backgroundImageUrlField = '';
    this.musicUrlField = '';
    this.templateKeyField = '';
    this.decorativeFrameField = 'floral-frame';
    this.accentColorField = '#d4af37';
    this.backgroundColorField = '#faf6ee';
    this.primaryFontField = 'Alex Brush';
    this.secondaryFontField = 'Cinzel';
    this.secondaryFontColorField = '#0f172a';
    this.htmlContentField = '';
    this.errorMessage.set('');
    this.stopPreviewAudio();
    this.isModalOpen.set(true);
  }

  protected openEditModal(template: DigitalTemplate): void {
    this.isEditing.set(true);
    this.editingId.set(template.id || null);
    this.titleField = template.title || '';
    this.categoryField = template.category || 'Mariage';
    this.descriptionField = template.description || '';
    this.imageUrlField = template.imageUrl || '';
    this.backgroundImageUrlField = template.backgroundImageUrl || '';
    this.musicUrlField = template.musicUrl || '';
    this.templateKeyField = template.templateKey || '';
    this.decorativeFrameField = template.decorativeFrame || ('Mariage' === template.category ? 'floral-frame' : 'geometric-frame');
    this.accentColorField = template.accentColor || '#d4af37';
    this.backgroundColorField = template.backgroundColor || ('Mariage' === template.category ? '#faf6ee' : '#f8f9fa');
    this.primaryFontField = template.primaryFont || ('Mariage' === template.category ? 'Alex Brush' : 'Playfair Display');
    this.secondaryFontField = template.secondaryFont || ('Mariage' === template.category ? 'Cinzel' : 'Montserrat');
    this.secondaryFontColorField = template.secondaryFontColor || ('Mariage' === template.category ? '#0f172a' : '#1e293b');
    this.htmlContentField = template.htmlContent || '';
    this.errorMessage.set('');
    this.stopPreviewAudio();
    this.isModalOpen.set(true);
  }

  protected closeAddModal(): void {
    this.stopPreviewAudio();
    this.isModalOpen.set(false);
  }

  protected onCategoryChange(): void {
    if (this.categoryField === 'Mariage') {
      this.decorativeFrameField = 'floral-frame';
      this.backgroundColorField = '#faf6ee';
      this.accentColorField = '#d4af37';
      this.primaryFontField = 'Alex Brush';
      this.secondaryFontField = 'Cinzel';
      this.secondaryFontColorField = '#0f172a';
    } else if (this.categoryField === 'Corporate') {
      this.decorativeFrameField = 'geometric-frame';
      this.backgroundColorField = '#f8f9fa';
      this.accentColorField = '#2b4c7e';
      this.primaryFontField = 'Montserrat';
      this.secondaryFontField = 'Playfair Display';
      this.secondaryFontColorField = '#1e293b';
    } else if (this.categoryField === 'Anniversaire') {
      this.decorativeFrameField = 'floral-frame';
      this.backgroundColorField = '#fff9f5';
      this.accentColorField = '#c27ba0';
      this.primaryFontField = 'Great Vibes';
      this.secondaryFontField = 'Cormorant Garamond';
      this.secondaryFontColorField = '#2c1810';
    } else {
      this.decorativeFrameField = 'minimal-edge';
      this.backgroundColorField = '#ffffff';
      this.accentColorField = '#1a1a1a';
      this.primaryFontField = 'Playfair Display';
      this.secondaryFontField = 'Montserrat';
      this.secondaryFontColorField = '#333333';
    }
  }

  protected saveTemplate(): void {
    if (!this.titleField.trim()) {
      this.errorMessage.set('Le nom du modèle est obligatoire.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const templatePayload: DigitalTemplate = {
      title: this.titleField.trim(),
      category: this.categoryField,
      description: this.descriptionField?.trim() || '',
      imageUrl: this.imageUrlField?.trim() || undefined,
      backgroundImageUrl: this.backgroundImageUrlField?.trim() || undefined,
      musicUrl: this.musicUrlField?.trim() || undefined,
      templateKey: this.templateKeyField?.trim() || undefined,
      decorativeFrame: this.decorativeFrameField || 'floral-frame',
      accentColor: this.accentColorField?.trim() || '#d4af37',
      backgroundColor: this.backgroundColorField?.trim() || '#faf6ee',
      primaryFont: this.primaryFontField?.trim() || 'Alex Brush',
      secondaryFont: this.secondaryFontField?.trim() || 'Cinzel',
      secondaryFontColor: this.secondaryFontColorField?.trim() || '#0f172a',
      htmlContent: this.htmlContentField?.trim() || undefined
    };

    if (this.isEditing() && this.editingId()) {
      this.templateService.updateTemplate(this.editingId()!, templatePayload).subscribe({
        next: (updated) => {
          this.templates.update(list => list.map(t => t.id === updated.id ? { ...t, ...updated } : t));
          this.successMessage.set('Modèle de faire-part mis à jour avec succès.');
          this.closeAddModal();
          this.isSubmitting.set(false);
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Une erreur est survenue lors de la mise à jour.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.templateService.createTemplate(templatePayload).subscribe({
        next: (created) => {
          this.templates.update(list => [...list, created]);
          this.successMessage.set('Nouveau modèle de faire-part créé avec succès.');
          this.closeAddModal();
          this.isSubmitting.set(false);
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Une erreur est survenue lors de la création.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  protected deleteTemplate(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce modèle de faire-part ?')) {
      this.templateService.deleteTemplate(id).subscribe({
        next: () => {
          this.templates.update(list => list.filter(t => t.id !== id));
          this.successMessage.set('Modèle supprimé avec succès.');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Une erreur est survenue lors de la suppression.');
        }
      });
    }
  }
}
