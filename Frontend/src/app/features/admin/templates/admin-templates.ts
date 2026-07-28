import { Component, OnInit, signal, inject } from '@angular/core';
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

  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Modal & Form States
  protected readonly isModalOpen = signal(false);
  protected readonly isSubmitting = signal(false);

  // Form Fields
  protected titleField = '';
  protected categoryField = 'Mariage';
  protected descriptionField = '';
  protected imageUrlField = '';
  protected htmlContentField = '';

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

  protected openAddModal(): void {
    this.titleField = '';
    this.categoryField = 'Mariage';
    this.descriptionField = '';
    this.imageUrlField = '';
    this.htmlContentField = '';
    this.errorMessage.set('');
    this.isModalOpen.set(true);
  }

  protected closeAddModal(): void {
    this.isModalOpen.set(false);
  }

  protected addTemplate(): void {
    if (!this.titleField.trim()) {
      this.errorMessage.set('Le titre est requis.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const newTemplate: DigitalTemplate = {
      title: this.titleField,
      category: this.categoryField,
      description: this.descriptionField,
      imageUrl: this.imageUrlField || undefined,
      htmlContent: this.htmlContentField || undefined
    };

    this.templateService.createTemplate(newTemplate).subscribe({
      next: (created) => {
        this.templates.update(list => [...list, created]);
        this.successMessage.set('Modèle créé avec succès.');
        this.closeAddModal();
        this.isSubmitting.set(false);
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Une erreur est survenue lors de la création.');
        this.isSubmitting.set(false);
      }
    });
  }

  protected deleteTemplate(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle de faire-part ?')) {
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
