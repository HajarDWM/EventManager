import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService, DigitalTemplate } from '../../../core/services/template.service';
import { loadGoogleFont } from '../../../core/utils/font-loader';
import { 
  TEMPLATE_TAXONOMY, 
  MainCategoryInfo, 
  SubCategoryInfo, 
  getCategoryTaxonomy, 
  getAllSubcategoriesForCategory 
} from '../../../core/constants/template-taxonomy.constants';

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

  // Taxonomy Reference
  protected readonly taxonomy = TEMPLATE_TAXONOMY;

  // Category & SubCategory Filters
  protected readonly activeCategoryFilter = signal<string>('ALL');
  protected readonly activeSubCategoryFilter = signal<string>('ALL');

  protected readonly currentMainCategoryInfo = computed(() => getCategoryTaxonomy(this.activeCategoryFilter()));
  protected readonly availableSubCategoriesForFilter = computed(() => this.currentMainCategoryInfo()?.subCategories || []);

  protected readonly filteredTemplates = computed(() => {
    const catFilter = this.activeCategoryFilter();
    const subFilter = this.activeSubCategoryFilter();
    let list = this.templates();

    if (catFilter !== 'ALL') {
      const mainCat = getCategoryTaxonomy(catFilter);
      if (mainCat) {
        list = list.filter(t => {
          const tMain = getCategoryTaxonomy(t.category);
          return tMain?.id === mainCat.id || t.category === mainCat.name;
        });
      }
    }

    if (subFilter !== 'ALL') {
      list = list.filter(t => t.subCategory === subFilter);
    }

    return list;
  });

  // Studio Page View & Form States
  protected readonly isEditorOpen = signal(false);
  protected readonly isModalOpen = computed(() => this.isEditorOpen());
  protected readonly isEditing = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly previewDevice = signal<'mobile' | 'tablet' | 'desktop'>('mobile');
  protected readonly activeEditorTab = signal<'identity' | 'design' | 'media' | 'effects'>('identity');

  protected setEditorTab(tab: 'identity' | 'design' | 'media' | 'effects'): void {
    this.activeEditorTab.set(tab);
  }

  // Form Fields
  protected titleField = '';
  protected categoryField = 'Célébrations Traditionnelles & Culturelles';
  protected subCategoryField = 'Mariage';
  protected descriptionField = '';
  protected imageUrlField = '';
  protected backgroundImageUrlField = '';
  protected backgroundImageDesktopUrlField = '';
  protected musicUrlField = '';
  protected templateKeyField = '';
  protected decorativeFrameField = 'none';
  protected accentColorField = '#d4af37';
  protected backgroundColorField = '#faf6ee';
  protected primaryFontField = 'Alex Brush';
  protected primaryFontSizeField = '36px';
  protected primaryFontWeightField = '700';
  protected primaryLetterSpacingField = 'normal';
  protected secondaryFontField = 'Cinzel';
  protected secondaryFontSizeField = '16px';
  protected secondaryFontWeightField = '400';
  protected secondaryLetterSpacingField = 'normal';
  protected secondaryFontColorField = '#0f172a';
  protected htmlContentField = '';

  protected readonly availableSubCategoriesForForm = computed(() => {
    return getAllSubcategoriesForCategory(this.categoryField);
  });

  // Preset Font Sizes & Styles
  protected readonly primaryFontSizeOptions = ['28px', '32px', '36px', '40px', '48px', '56px'];
  protected readonly secondaryFontSizeOptions = ['13px', '14px', '16px', '18px', '20px', '22px'];
  
  protected readonly fontWeightOptions = [
    { label: 'Fin (300)', value: '300' },
    { label: 'Normal (400)', value: '400' },
    { label: 'Demi-Gras (600)', value: '600' },
    { label: 'Gras (700)', value: '700' },
    { label: 'Extra-Gras (800)', value: '800' }
  ];

  protected readonly letterSpacingOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Discret (1px)', value: '1px' },
    { label: 'Aéré Prestige (2px)', value: '2px' },
    { label: 'Grand Format (3px)', value: '3px' },
    { label: 'Majestueux (4px)', value: '4px' }
  ];

  // Available Luxury Google Fonts with direct live style binding & suggestions
  protected readonly availableFonts = [
    { name: 'Alex Brush', label: 'Alex Brush (Script Délicat & Cérémonial)', fontGroup: 'Cursive', sample: 'Invitation Spéciale' },
    { name: 'Great Vibes', label: 'Great Vibes (Calligraphie Fluide & Romantique)', fontGroup: 'Cursive', sample: 'Yassine & Zineb' },
    { name: 'Dancing Script', label: 'Dancing Script (Moderne & Enjoué)', fontGroup: 'Cursive', sample: 'Soirée de Gala' },
    { name: 'Allura', label: 'Allura (Calligraphie Majestueuse)', fontGroup: 'Cursive', sample: 'Mariage Royal' },
    { name: 'Pinyon Script', label: 'Pinyon Script (Élégance Aristocratique)', fontGroup: 'Cursive', sample: 'Réception d\'Honneur' },
    { name: 'Parisienne', label: 'Parisienne (Romantisme Parisien)', fontGroup: 'Cursive', sample: 'Dîner aux Chandelles' },
    { name: 'Playfair Display', label: 'Playfair Display (Serif Luxueux & Éditorial)', fontGroup: 'Serif', sample: 'Mariage d\'Exception' },
    { name: 'Cormorant Garamond', label: 'Cormorant Garamond (Classique & Haute Joaillerie)', fontGroup: 'Serif', sample: 'Célébration Prestigieuse' },
    { name: 'Cinzel', label: 'Cinzel (Impérial & Monumental)', fontGroup: 'Serif', sample: 'RÉCEPTION ROYALE' },
    { name: 'Cinzel Decorative', label: 'Cinzel Decorative (Baroque Ornemental)', fontGroup: 'Serif', sample: 'GALA PRESTIGE' },
    { name: 'Prata', label: 'Prata (Serif Didone Raffiné)', fontGroup: 'Serif', sample: 'Cérémonie Privée' },
    { name: 'Bodoni Moda', label: 'Bodoni Moda (Haute Couture & Vogue)', fontGroup: 'Serif', sample: 'L\'Excellence' },
    { name: 'Montserrat', label: 'Montserrat (Moderne & Sans-Serif Épuré)', fontGroup: 'Sans-Serif', sample: 'Conférence & Événement' },
    { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Contemporain & Lisible)', fontGroup: 'Sans-Serif', sample: 'Événement Corporate' }
  ];

  // Quick Preset Font Pills for One-Click Selection
  protected readonly popularPrimaryFonts = ['Alex Brush', 'Great Vibes', 'Dancing Script', 'Allura', 'Playfair Display', 'Cinzel'];
  protected readonly popularSecondaryFonts = ['Cormorant Garamond', 'Cinzel', 'Montserrat', 'Playfair Display', 'Plus Jakarta Sans', 'Prata'];

  // Audio Preview & Presets
  protected readonly isPreviewAudioPlaying = signal(false);
  private previewAudioElement: HTMLAudioElement | null = null;
  protected readonly musicPresets = [
    { label: 'Mariage Marocain & Oud Calme', url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c3c3933c06.mp3' },
    { label: 'Romantique & Acoustique', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3' },
    { label: 'Andalou Traditionnel', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: 'Lounge & Jazz Élégant', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_33bd95d2c6.mp3' }
  ];

  public onPrimaryFontChange(val: string): void {
    this.primaryFontField = val;
    loadGoogleFont(val);
  }

  public selectPrimaryFont(fontName: string): void {
    this.primaryFontField = fontName;
    loadGoogleFont(fontName);
  }

  public onSecondaryFontChange(val: string): void {
    this.secondaryFontField = val;
    loadGoogleFont(val);
  }

  public selectSecondaryFont(fontName: string): void {
    this.secondaryFontField = fontName;
    loadGoogleFont(fontName);
  }

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
        this.errorMessage.set('Impossible de charger les modèles d\'invitation.');
        this.isLoading.set(false);
      }
    });
  }

  protected setCategoryFilter(categoryId: string): void {
    this.activeCategoryFilter.set(categoryId);
    this.activeSubCategoryFilter.set('ALL');
  }

  protected setSubCategoryFilter(subCategory: string): void {
    this.activeSubCategoryFilter.set(subCategory);
  }

  public getTemplateCountForCategory(catId: string): number {
    if (catId === 'ALL') return this.templates().length;
    const mainCat = getCategoryTaxonomy(catId);
    if (!mainCat) return 0;
    return this.templates().filter(t => {
      const tMain = getCategoryTaxonomy(t.category);
      return tMain?.id === mainCat.id || t.category === mainCat.name;
    }).length;
  }

  public getMainCategoryBadgeClass(category: string): string {
    const tax = getCategoryTaxonomy(category);
    return tax ? tax.badgeClass : 'bg-secondary-subtle text-secondary';
  }

  public getMainCategoryIcon(category: string): string {
    const tax = getCategoryTaxonomy(category);
    return tax ? tax.icon : 'fa-tag';
  }

  public getSubCategoryIcon(category: string, subCategory?: string): string {
    if (!subCategory) return 'fa-folder';
    const tax = getCategoryTaxonomy(category);
    const sub = tax?.subCategories.find(s => s.name.toLowerCase() === subCategory.toLowerCase());
    return sub ? sub.icon : 'fa-star';
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
    this.cdr.markForCheck();
  }

  protected onBackgroundDesktopFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) return;

        const img = new Image();
        img.onload = () => {
          const maxDim = 1920;
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
            this.backgroundImageDesktopUrlField = canvas.toDataURL('image/jpeg', 0.88);
          } else {
            this.backgroundImageDesktopUrlField = rawResult;
          }
          this.cdr.markForCheck();
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeBackgroundDesktopImage(): void {
    this.backgroundImageDesktopUrlField = '';
    this.cdr.markForCheck();
  }

  public getLivePreviewBackgroundImage(): string {
    if (this.previewDevice() === 'desktop' || this.previewDevice() === 'tablet') {
      return this.backgroundImageDesktopUrlField || this.backgroundImageUrlField || '';
    }
    return this.backgroundImageUrlField || '';
  }

  protected isBase64(val: string): boolean {
    return !!val && val.startsWith('data:');
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

  public setPreviewDevice(device: 'mobile' | 'tablet' | 'desktop'): void {
    this.previewDevice.set(device);
  }

  public isDarkBg(hexColor?: string): boolean {
    if (!hexColor) return false;
    let color = hexColor.trim();
    if (color.startsWith('#')) color = color.substring(1);
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    if (color.length !== 6) return false;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 140;
  }

  protected openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.titleField = '';
    this.categoryField = 'Célébrations Traditionnelles & Culturelles';
    this.subCategoryField = 'Mariage';
    this.descriptionField = '';
    this.imageUrlField = '';
    this.backgroundImageUrlField = '';
    this.backgroundImageDesktopUrlField = '';
    this.musicUrlField = '';
    this.templateKeyField = '';
    this.decorativeFrameField = 'none';
    this.accentColorField = '#d4af37';
    this.backgroundColorField = '#faf6ee';
    this.primaryFontField = 'Alex Brush';
    this.primaryFontSizeField = '36px';
    this.primaryFontWeightField = '700';
    this.primaryLetterSpacingField = 'normal';
    this.secondaryFontField = 'Cinzel';
    this.secondaryFontSizeField = '16px';
    this.secondaryFontWeightField = '400';
    this.secondaryLetterSpacingField = 'normal';
    this.secondaryFontColorField = '#0f172a';
    this.htmlContentField = '';
    this.errorMessage.set('');
    this.activeEditorTab.set('identity');
    this.stopPreviewAudio();
    loadGoogleFont(this.primaryFontField);
    loadGoogleFont(this.secondaryFontField);
    this.isEditorOpen.set(true);
  }

  protected openEditModal(template: DigitalTemplate): void {
    this.isEditing.set(true);
    this.editingId.set(template.id || null);
    this.activeEditorTab.set('identity');
    this.titleField = template.title || '';
    
    // Normalize category to full taxonomy title if needed
    const tax = getCategoryTaxonomy(template.category);
    this.categoryField = tax ? tax.name : (template.category || 'Célébrations Traditionnelles & Culturelles');
    this.subCategoryField = template.subCategory || (tax?.subCategories[0]?.name || 'Mariage');

    this.descriptionField = template.description || '';
    this.imageUrlField = template.imageUrl || '';
    this.backgroundImageUrlField = template.backgroundImageUrl || '';
    this.backgroundImageDesktopUrlField = template.backgroundImageDesktopUrl || '';
    this.musicUrlField = template.musicUrl || '';
    this.templateKeyField = template.templateKey || '';
    this.decorativeFrameField = template.decorativeFrame || 'none';
    this.accentColorField = template.accentColor || '#d4af37';
    this.backgroundColorField = template.backgroundColor || '#faf6ee';
    this.primaryFontField = template.primaryFont || 'Alex Brush';
    this.primaryFontSizeField = template.primaryFontSize || '36px';
    this.primaryFontWeightField = template.primaryFontWeight || '700';
    this.primaryLetterSpacingField = template.primaryLetterSpacing || 'normal';
    this.secondaryFontField = template.secondaryFont || 'Cinzel';
    this.secondaryFontSizeField = template.secondaryFontSize || '16px';
    this.secondaryFontWeightField = template.secondaryFontWeight || '400';
    this.secondaryLetterSpacingField = template.secondaryLetterSpacing || 'normal';
    this.secondaryFontColorField = template.secondaryFontColor || '#0f172a';
    this.htmlContentField = template.htmlContent || '';
    this.errorMessage.set('');
    this.stopPreviewAudio();
    loadGoogleFont(this.primaryFontField);
    loadGoogleFont(this.secondaryFontField);
    this.isEditorOpen.set(true);
  }

  protected closeAddModal(): void {
    this.stopPreviewAudio();
    this.isEditorOpen.set(false);
  }

  protected onCategoryChange(): void {
    const subs = getAllSubcategoriesForCategory(this.categoryField);
    if (subs.length > 0) {
      this.subCategoryField = subs[0].name;
    }

    const tax = getCategoryTaxonomy(this.categoryField);
    if (tax?.id === 'TRADITIONAL') {
      this.decorativeFrameField = 'none';
      this.backgroundColorField = '#faf6ee';
      this.accentColorField = '#d4af37';
      this.primaryFontField = 'Alex Brush';
      this.primaryFontSizeField = '36px';
      this.primaryFontWeightField = '700';
      this.primaryLetterSpacingField = 'normal';
      this.secondaryFontField = 'Cinzel';
      this.secondaryFontSizeField = '16px';
      this.secondaryFontWeightField = '400';
      this.secondaryLetterSpacingField = 'normal';
      this.secondaryFontColorField = '#0f172a';
    } else if (tax?.id === 'FAMILY') {
      this.decorativeFrameField = 'none';
      this.backgroundColorField = '#fff9f5';
      this.accentColorField = '#c27ba0';
      this.primaryFontField = 'Great Vibes';
      this.primaryFontSizeField = '38px';
      this.primaryFontWeightField = '700';
      this.primaryLetterSpacingField = 'normal';
      this.secondaryFontField = 'Cormorant Garamond';
      this.secondaryFontSizeField = '16px';
      this.secondaryFontWeightField = '400';
      this.secondaryLetterSpacingField = 'normal';
      this.secondaryFontColorField = '#2c1810';
    } else if (tax?.id === 'CORPORATE') {
      this.decorativeFrameField = 'none';
      this.backgroundColorField = '#f8f9fa';
      this.accentColorField = '#2b4c7e';
      this.primaryFontField = 'Montserrat';
      this.primaryFontSizeField = '32px';
      this.primaryFontWeightField = '600';
      this.primaryLetterSpacingField = '1px';
      this.secondaryFontField = 'Playfair Display';
      this.secondaryFontSizeField = '15px';
      this.secondaryFontWeightField = '400';
      this.secondaryLetterSpacingField = 'normal';
      this.secondaryFontColorField = '#1e293b';
    } else if (tax?.id === 'SEASONAL_SOCIAL') {
      this.decorativeFrameField = 'none';
      this.backgroundColorField = '#0b0b0b';
      this.accentColorField = '#fbbf24';
      this.primaryFontField = 'Playfair Display';
      this.primaryFontSizeField = '36px';
      this.primaryFontWeightField = '700';
      this.primaryLetterSpacingField = '2px';
      this.secondaryFontField = 'Cinzel';
      this.secondaryFontSizeField = '16px';
      this.secondaryFontWeightField = '400';
      this.secondaryLetterSpacingField = '1px';
      this.secondaryFontColorField = '#f0dd9e';
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
      subCategory: this.subCategoryField,
      description: this.descriptionField?.trim() || '',
      imageUrl: this.imageUrlField?.trim() || undefined,
      backgroundImageUrl: this.backgroundImageUrlField?.trim() ? this.backgroundImageUrlField.trim() : null,
      backgroundImageDesktopUrl: this.backgroundImageDesktopUrlField?.trim() ? this.backgroundImageDesktopUrlField.trim() : null,
      musicUrl: this.musicUrlField?.trim() ? this.musicUrlField.trim() : null,
      templateKey: this.templateKeyField?.trim() || undefined,
      decorativeFrame: this.decorativeFrameField || 'none',
      accentColor: this.accentColorField?.trim() || '#d4af37',
      backgroundColor: this.backgroundColorField?.trim() || '#faf6ee',
      primaryFont: this.primaryFontField?.trim() || 'Alex Brush',
      primaryFontSize: this.primaryFontSizeField?.trim() || '36px',
      primaryFontWeight: this.primaryFontWeightField || '700',
      primaryLetterSpacing: this.primaryLetterSpacingField || 'normal',
      secondaryFont: this.secondaryFontField?.trim() || 'Cinzel',
      secondaryFontSize: this.secondaryFontSizeField?.trim() || '16px',
      secondaryFontWeight: this.secondaryFontWeightField || '400',
      secondaryLetterSpacing: this.secondaryLetterSpacingField || 'normal',
      secondaryFontColor: this.secondaryFontColorField?.trim() || '#0f172a',
      htmlContent: this.htmlContentField?.trim() || undefined
    };

    if (this.isEditing() && this.editingId()) {
      this.templateService.updateTemplate(this.editingId()!, templatePayload).subscribe({
        next: (updated) => {
          this.templates.update(list => list.map(t => t.id === updated.id ? { ...t, ...updated } : t));
          this.successMessage.set('Modèle d\'invitation mis à jour avec succès.');
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
          this.successMessage.set('Nouveau modèle d\'invitation créé avec succès.');
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
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce modèle d\'invitation ?')) {
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
