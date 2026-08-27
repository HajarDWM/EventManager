import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuestService, Guest, GuestStatus } from '../../../../core/services/guest.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CatererService } from '../../../../core/services/caterer.service';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guest-list.html'
})
export class GuestList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly guestService = inject(GuestService);
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly http = inject(HttpClient);

  protected readonly eventId = signal<number | null>(null);
  protected readonly event = signal<Event | null>(null);
  protected readonly guests = signal<Guest[]>([]);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly isSubscriptionExpired = computed(() => {
    const profile = this.catererService.currentProfile();
    if (profile && profile.role === 'SUPER_ADMIN') return false;
    return profile && (!!profile.isExpired || !!profile.expired || profile.subscriptionStatus === 'EXPIRED');
  });

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

  // Group Filtering state
  protected readonly selectedGroupFilter = signal<string>('ALL');

  protected readonly uniqueGroups = computed(() => {
    const list = this.guests().map(g => g.groupName).filter((g): g is string => !!g);
    return Array.from(new Set(list));
  });

  protected readonly filteredGuests = computed(() => {
    const list = this.guests();
    const filter = this.selectedGroupFilter();
    if (filter === 'ALL') return list;
    return list.filter(g => g.groupName === filter);
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
      this.loadEvent(parsedId);
      this.loadGuests(parsedId);
    } else {
      this.errorMessage.set('Identifiant d\'événement invalide.');
      this.isLoading.set(false);
    }
  }

  private loadEvent(eventId: number): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (ev) => this.event.set(ev),
      error: (err) => console.error('Erreur chargement événement:', err)
    });
  }

  private loadGuests(eventId: number): void {
    this.isLoading.set(true);
    this.guestService.getGuestsByEvent(eventId).subscribe({
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

  protected get confirmedCount(): number {
    return this.guests().filter(g => g.status === 'CONFIRMED').length;
  }

  protected get pendingCount(): number {
    return this.guests().filter(g => g.status === 'PENDING').length;
  }

  protected get declinedCount(): number {
    return this.guests().filter(g => g.status === 'DECLINED').length;
  }

  protected openAddModal(): void {
    if (this.isSubscriptionExpired()) {
      this.errorMessage.set("Abonnement expiré — Mode consultation uniquement. Veuillez renouveler votre abonnement pour ajouter de nouveaux invités.");
      return;
    }
    this.isEditing.set(false);
    this.editingGuestId.set(null);
    this.fullName.set('');
    this.email.set('');
    this.phone.set('');
    this.status.set('PENDING');
    this.tableNumber.set('');
    this.dietaryRequirements.set('');
    this.groupName.set('');
    this.isModalOpen.set(true);
  }

  protected openEditModal(guest: Guest): void {
    if (this.isSubscriptionExpired()) {
      this.errorMessage.set("Abonnement expiré — Mode consultation uniquement. Veuillez renouveler votre abonnement pour modifier des invités.");
      return;
    }
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
      this.guestService.updateGuest(this.editingGuestId()!, guestPayload).subscribe({
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
      this.guestService.createGuest(currentEventId, guestPayload).subscribe({
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
      this.guestService.deleteGuest(guest.id).subscribe({
        next: () => {
          this.successMessage.set('Invité supprimé.');
          if (currentEventId) this.loadGuests(currentEventId);
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors de la suppression de l\'invité.');
          console.error(err);
        }
      });
    }
  }

  protected onExportCSV(): void {
    const csvRows: string[] = [];
    
    // Header row with UTF-8 BOM for French Excel compatibility
    const headers = ['Nom Complet', 'Téléphone', 'Email', 'Groupe', 'Statut', 'Position', 'Régime Alimentaire / Notes'];
    csvRows.push(headers.join(';'));
    
    for (const g of this.guests()) {
      const row = [
        g.fullName || '',
        g.phone || '',
        g.email || '',
        g.groupName || '',
        g.status || 'PENDING',
        g.tableNumber || '',
        g.dietaryRequirements || ''
      ];
      
      // Escape values (replacing double quotes and semicolons)
      const escapedRow = row.map(val => {
        let clean = val.replace(/"/g, '""'); // Escape quotes
        if (clean.includes(';') || clean.includes('\n') || clean.includes('\r')) {
          clean = `"${clean}"`; // Wrap in quotes if it contains semicolons or newlines
        }
        return clean;
      });
      csvRows.push(escapedRow.join(';'));
    }
    
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const eventTitle = this.event()?.title ? this.event()?.title.replace(/[^a-zA-Z0-9]/g, '_') : 'evenement';
    link.setAttribute('href', url);
    link.setAttribute('download', `invites_${eventTitle}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  protected onDownloadTemplate(): void {
    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.http.get(`/api/events/${currentEventId}/guests/template`, { responseType: 'blob' }).subscribe({
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

  protected onImportFile(event: any): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.guestService.importGuests(currentEventId, file).subscribe({
      next: (results) => {
        this.successMessage.set(`${results.length} invités importés avec succès.`);
        this.loadGuests(currentEventId);
        target.value = '';
      },
      error: (err) => {
        this.errorMessage.set("Une erreur est survenue lors de l'importation des invités.");
        this.isLoading.set(false);
        target.value = '';
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
