import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientGuestService } from '../../core/services/client-guest.service';
import { Guest, GuestStatus } from '../../core/services/guest.service';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';

@Component({
  selector: 'app-client-guest-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-guest-list.html',
  styleUrls: ['./client-guest-list.scss']
})
export class ClientGuestList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientGuestService = inject(ClientGuestService);
  private readonly clientAuthService = inject(ClientAuthService);

  protected readonly eventId = signal<number | null>(null);
  protected readonly guests = signal<Guest[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  // Modal / Form state
  protected readonly isModalOpen = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);

  // Form Fields
  protected readonly editingGuestId = signal<number | null>(null);
  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly status = signal<GuestStatus>('PENDING');
  protected readonly tableNumber = signal('');
  protected readonly dietaryRequirements = signal('');
  protected readonly groupName = signal('');

  protected readonly confirmedCount = computed(() => this.guests().filter(g => g.status === 'CONFIRMED').length);
  protected readonly pendingCount = computed(() => this.guests().filter(g => g.status === 'PENDING').length);

  protected readonly uniqueGroups = computed(() => {
    const list = this.guests().map(g => g.groupName).filter((g): g is string => !!g);
    return Array.from(new Set(list));
  });

  protected readonly groupSuggestions = computed(() => {
    const globalGroups = [
      'Famille Proche', 'Famille Élargie', 'Amis & Proches', 'Hommes', 'Femmes',
      'VIP', 'Enfants', 'Direction / Management', 'Partenaires / Clients VIP',
      'Équipe Interne / Salariés', 'Presse / Médias', 'Invités Externes',
      'VIP / Sponsors', 'Table d\'Honneur', 'Grand Public / Standard',
      'Presse & Officiels', 'Staff / Organisateurs'
    ];
    const currentUnique = this.uniqueGroups();
    const combined = [...globalGroups, ...currentUnique];
    return Array.from(new Set(combined));
  });

  protected readonly isGroupDropdownOpen = signal<boolean>(false);

  protected readonly filteredGroupSuggestions = computed(() => {
    const input = this.groupName().toLowerCase().trim();
    const suggestions = this.groupSuggestions();
    if (!input) return suggestions;
    return suggestions.filter(s => s.toLowerCase().includes(input));
  });

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      this.eventId.set(parsedId);
      this.loadGuests(parsedId);
    } else {
      this.errorMessage.set('Identifiant d\'événement invalide.');
      this.isLoading.set(false);
    }
  }

  private loadGuests(eventId: number): void {
    this.isLoading.set(true);
    this.clientGuestService.getGuestsByEvent(eventId).subscribe({
      next: (list) => {
        this.guests.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger la liste des invités.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  protected openAddModal(): void {
    this.isEditing.set(false);
    this.editingGuestId.set(null);
    this.resetForm();
    this.isModalOpen.set(true);
  }

  protected openEditModal(guest: Guest): void {
    this.isEditing.set(true);
    this.editingGuestId.set(guest.id || null);
    this.fullName.set(guest.fullName || '');
    this.email.set(guest.email || '');
    this.phone.set(guest.phone || '');
    this.status.set(guest.status || 'PENDING');
    this.tableNumber.set(guest.tableNumber || '');
    this.dietaryRequirements.set(guest.dietaryRequirements || '');
    this.groupName.set(guest.groupName || '');
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  private resetForm(): void {
    this.fullName.set('');
    this.email.set('');
    this.phone.set('');
    this.status.set('PENDING');
    this.tableNumber.set('');
    this.dietaryRequirements.set('');
    this.groupName.set('');
  }

  protected onSaveGuest(): void {
    if (!this.fullName().trim()) {
      this.errorMessage.set('Le nom complet est obligatoire.');
      return;
    }

    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const guestPayload: Guest = {
      fullName: this.fullName(),
      email: this.email(),
      phone: this.phone(),
      status: this.status(),
      tableNumber: this.tableNumber(),
      dietaryRequirements: this.dietaryRequirements(),
      groupName: this.groupName()
    };

    if (this.isEditing() && this.editingGuestId()) {
      this.clientGuestService.updateGuest(currentEventId, this.editingGuestId()!, guestPayload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.successMessage.set('Invité mis à jour avec succès.');
          this.loadGuests(currentEventId);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de la mise à jour de l\'invité.');
          console.error(err);
        }
      });
    } else {
      this.clientGuestService.createGuest(currentEventId, guestPayload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.successMessage.set('Invité ajouté avec succès.');
          this.loadGuests(currentEventId);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de l\'ajout de l\'invité.');
          console.error(err);
        }
      });
    }
  }

  protected onDeleteGuest(guest: Guest): void {
    if (!guest.id) return;
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'invité "${guest.fullName}" ?`)) {
      const currentEventId = this.eventId();
      if (!currentEventId) return;
      
      this.clientGuestService.deleteGuest(currentEventId, guest.id).subscribe({
        next: () => {
          this.successMessage.set('Invité supprimé.');
          this.loadGuests(currentEventId);
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors de la suppression de l\'invité.');
          console.error(err);
        }
      });
    }
  }

  protected onDownloadTemplate(): void {
    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.clientGuestService.downloadTemplate(currentEventId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'modele_invites.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage.set("Erreur lors du téléchargement du modèle.");
        console.error(err);
      }
    });
  }

  protected toggleGroupDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isGroupDropdownOpen.update(v => !v);
  }

  protected selectGroupSuggestion(grp: string): void {
    this.groupName.set(grp);
    this.isGroupDropdownOpen.set(false);
  }

  protected onGroupInputChange(val: string): void {
    this.groupName.set(val);
    this.isGroupDropdownOpen.set(true);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && !target.closest('.group-autocomplete-container')) {
      this.isGroupDropdownOpen.set(false);
    }
  }
}
