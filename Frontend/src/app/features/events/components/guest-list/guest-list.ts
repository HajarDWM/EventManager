import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuestService, Guest, GuestStatus } from '../../../../core/services/guest.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { forkJoin } from 'rxjs';

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

  protected onExportCSV(): void {
    const csvRows: string[] = [];
    
    // Header row with UTF-8 BOM for French Excel compatibility
    const headers = ['Nom Complet', 'Email', 'Téléphone', 'Statut', 'Position', 'Régime Alimentaire / Notes'];
    csvRows.push(headers.join(';'));
    
    for (const g of this.guests()) {
      const row = [
        g.fullName || '',
        g.email || '',
        g.phone || '',
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

  protected onImportCSV(event: any): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      this.parseAndImportCSV(text);
      // Reset input value to allow importing the same file again
      target.value = '';
    };
    reader.onerror = () => {
      this.errorMessage.set("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file, 'UTF-8');
  }

  private parseAndImportCSV(text: string): void {
    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      // Split lines by newline
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        throw new Error("Le fichier est vide ou ne contient pas d'invités.");
      }

      // Detect separator: check first line (header)
      const headerLine = lines[0];
      let sep = ';';
      if (headerLine.includes(';') && !headerLine.includes(',')) {
        sep = ';';
      } else if (headerLine.includes(',') && !headerLine.includes(';')) {
        sep = ',';
      } else {
        sep = headerLine.includes(';') ? ';' : (headerLine.includes(',') ? ',' : ';');
      }

      const importedGuests: Guest[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // A basic CSV parser that handles quoted strings
        const columns: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === sep && !inQuotes) {
            columns.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        columns.push(currentValue.trim());

        // We expect columns: [fullName, email, phone, status, position, dietaryRequirements]
        // Clean double quotes if any remained
        const cleanedCols = columns.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));

        const fullName = cleanedCols[0];
        if (!fullName) {
          continue; // Skip lines without a name
        }

        // Map status
        let statusVal: GuestStatus = 'PENDING';
        const rawStatus = cleanedCols[3]?.toUpperCase() || '';
        if (rawStatus.includes('CONFIRM') || rawStatus.includes('OUI') || rawStatus === 'CONFIRMED') {
          statusVal = 'CONFIRMED';
        } else if (rawStatus.includes('DECLIN') || rawStatus.includes('NON') || rawStatus === 'DECLINED') {
          statusVal = 'DECLINED';
        }

        importedGuests.push({
          fullName: fullName,
          email: cleanedCols[1] || '',
          phone: cleanedCols[2] || '',
          status: statusVal,
          tableNumber: cleanedCols[4] || '',
          dietaryRequirements: cleanedCols[5] || ''
        });
      }

      if (importedGuests.length === 0) {
        throw new Error("Aucun invité valide trouvé dans le fichier.");
      }

      this.saveImportedGuests(currentEventId, importedGuests);

    } catch (err: any) {
      this.isLoading.set(false);
      this.errorMessage.set(err.message || "Erreur lors du traitement du fichier CSV.");
      console.error(err);
    }
  }

  private saveImportedGuests(eventId: number, list: Guest[]): void {
    const obsList = list.map(g => this.guestService.createGuest(eventId, g));
    forkJoin(obsList).subscribe({
      next: (results) => {
        this.successMessage.set(`${results.length} invités importés avec succès.`);
        this.loadGuests(eventId);
      },
      error: (err) => {
        this.errorMessage.set("Une erreur est survenue lors de l'importation de certains invités.");
        this.loadGuests(eventId); // Reload what succeeded
        console.error(err);
      }
    });
  }
}
