import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuestService, Guest, GuestStatus } from '../../../../core/services/guest.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

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

  protected readonly eventId = signal<number | null>(null);
  protected readonly event = signal<Event | null>(null);
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
    this.isEditing.set(false);
    this.editingGuestId.set(null);
    this.fullName.set('');
    this.email.set('');
    this.phone.set('');
    this.status.set('PENDING');
    this.tableNumber.set('');
    this.dietaryRequirements.set('');
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
      dietaryRequirements: this.dietaryRequirements()
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
}
