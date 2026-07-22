import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InvitationTemplate } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-invitation-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-invitation-templates.html'
})
export class AdminInvitationTemplates implements OnInit {
  private readonly adminService = inject(AdminService);

  // States
  protected readonly templates = signal<InvitationTemplate[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Selected Template for Create/Edit Modal
  protected selectedTemplate = signal<InvitationTemplate | null>(null);
  protected isEditMode = signal(false);

  // Form Fields
  protected nameField = signal('');
  protected subjectField = signal('');
  protected contentField = signal('');

  // Dynamic Preview variables
  protected previewGuestName = signal('Jean Dupont');
  protected previewEventTitle = signal('Gala Annuel de Printemps');
  protected previewEventDate = signal('15 Septembre 2026');
  protected previewEventLocation = signal('Château de Versailles');

  // Computed Live Preview
  protected readonly livePreview = computed(() => {
    let text = this.contentField();
    if (!text) return '';
    text = text.replace(/\{\{guest_name\}\}/g, this.previewGuestName());
    text = text.replace(/\{\{event_title\}\}/g, this.previewEventTitle());
    text = text.replace(/\{\{event_date\}\}/g, this.previewEventDate());
    text = text.replace(/\{\{event_location\}\}/g, this.previewEventLocation());
    return text;
  });

  public ngOnInit(): void {
    this.loadTemplates();
  }

  protected loadTemplates(): void {
    this.isLoading.set(true);
    this.adminService.getAllTemplates().subscribe({
      next: (res) => {
        this.templates.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors du chargement des modèles d\'invitations.');
        console.error(err);
      }
    });
  }

  protected openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedTemplate.set({
      name: '',
      subject: '',
      content: ''
    });
    this.nameField.set('');
    this.subjectField.set('');
    this.contentField.set('');
  }

  protected openEditModal(template: InvitationTemplate): void {
    this.isEditMode.set(true);
    this.selectedTemplate.set(template);
    this.nameField.set(template.name);
    this.subjectField.set(template.subject);
    this.contentField.set(template.content);
  }

  protected closeTemplateModal(): void {
    this.selectedTemplate.set(null);
  }

  protected saveTemplate(): void {
    if (!this.nameField().trim() || !this.subjectField().trim() || !this.contentField().trim()) {
      this.errorMessage.set('Veuillez remplir tous les champs du modèle.');
      return;
    }

    const payload: InvitationTemplate = {
      name: this.nameField(),
      subject: this.subjectField(),
      content: this.contentField()
    };

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.isEditMode() && this.selectedTemplate()?.id) {
      this.adminService.updateTemplate(this.selectedTemplate()!.id!, payload).subscribe({
        next: () => {
          this.loadTemplates();
          this.closeTemplateModal();
          this.successMessage.set('Modèle d\'invitation modifié avec succès.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Impossible de modifier le modèle.');
          console.error(err);
        }
      });
    } else {
      this.adminService.createTemplate(payload).subscribe({
        next: () => {
          this.loadTemplates();
          this.closeTemplateModal();
          this.successMessage.set('Modèle d\'invitation créé avec succès.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Impossible de créer le modèle.');
          console.error(err);
        }
      });
    }
  }

  protected deleteTemplate(template: InvitationTemplate): void {
    if (!template.id) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${template.name}" ?`)) {
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.adminService.deleteTemplate(template.id).subscribe({
      next: () => {
        this.loadTemplates();
        this.successMessage.set('Modèle d\'invitation supprimé.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de supprimer le modèle.');
        console.error(err);
      }
    });
  }
}
