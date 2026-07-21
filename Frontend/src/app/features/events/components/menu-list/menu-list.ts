import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuItemService, MenuItem } from '../../../../core/services/menu-item.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './menu-list.html'
})
export class MenuList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly menuItemService = inject(MenuItemService);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal<number | null>(null);
  protected readonly event = signal<Event | null>(null);
  protected readonly menuItems = signal<MenuItem[]>([]);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly successMessage = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  // Category Filter
  protected readonly selectedCategory = signal<string>('ALL');

  // Modal State
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isEditing = signal<boolean>(false);
  protected readonly editingItemId = signal<number | null>(null);

  // Form Fields
  protected readonly name = signal<string>('');
  protected readonly category = signal<string>('STARTER');
  protected readonly pricePerPerson = signal<number>(0);
  protected readonly dietaryTag = signal<string>('');
  protected readonly description = signal<string>('');

  // Computed Metrics
  protected readonly filteredMenuItems = computed(() => {
    const items = this.menuItems();
    const cat = this.selectedCategory();
    if (cat === 'ALL') return items;
    return items.filter(item => item.category === cat);
  });

  protected readonly totalPricePerPerson = computed(() => {
    return this.menuItems().reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
  });

  protected readonly totalCateringBudget = computed(() => {
    const guests = this.event()?.guestCount || 0;
    return this.totalPricePerPerson() * guests;
  });

  protected readonly starterCount = computed(() => {
    return this.menuItems().filter(i => i.category === 'STARTER').length;
  });

  protected readonly mainCount = computed(() => {
    return this.menuItems().filter(i => i.category === 'MAIN').length;
  });

  protected readonly dessertCount = computed(() => {
    return this.menuItems().filter(i => i.category === 'DESSERT').length;
  });

  protected readonly beverageCount = computed(() => {
    return this.menuItems().filter(i => i.category === 'BEVERAGE').length;
  });

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.eventId.set(id);
      this.loadEventData(id);
      this.loadMenuItems(id);
    }
  }

  private loadEventData(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (data) => this.event.set(data),
      error: (err) => console.error('Erreur chargement événement', err)
    });
  }

  protected loadMenuItems(id: number): void {
    this.isLoading.set(true);
    this.menuItemService.getMenuItemsByEvent(id).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger le menu de cet événement.');
        console.error(err);
      }
    });
  }

  protected openAddModal(): void {
    this.isEditing.set(false);
    this.editingItemId.set(null);
    this.name.set('');
    this.category.set('STARTER');
    this.pricePerPerson.set(0);
    this.dietaryTag.set('');
    this.description.set('');
    this.isModalOpen.set(true);
  }

  protected openEditModal(item: MenuItem): void {
    this.isEditing.set(true);
    this.editingItemId.set(item.id || null);
    this.name.set(item.name || '');
    this.category.set(item.category || 'STARTER');
    this.pricePerPerson.set(item.pricePerPerson || 0);
    this.dietaryTag.set(item.dietaryTag || '');
    this.description.set(item.description || '');
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected onSaveMenuItem(): void {
    if (!this.name().trim()) {
      this.errorMessage.set('Le nom du plat est obligatoire.');
      return;
    }

    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload: MenuItem = {
      name: this.name().trim(),
      category: this.category(),
      pricePerPerson: this.pricePerPerson() || 0,
      dietaryTag: this.dietaryTag().trim(),
      description: this.description().trim()
    };

    if (this.isEditing() && this.editingItemId()) {
      this.menuItemService.updateMenuItem(this.editingItemId()!, payload).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.menuItems.update(list => list.map(i => i.id === updated.id ? updated : i));
          this.successMessage.set('Plat modifié avec succès !');
          this.closeModal();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de la modification du plat.');
          console.error(err);
        }
      });
    } else {
      this.menuItemService.createMenuItem(currentEventId, payload).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.menuItems.update(list => [...list, created]);
          this.successMessage.set('Plat ajouté au menu !');
          this.closeModal();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de la création du plat.');
          console.error(err);
        }
      });
    }
  }

  protected onDeleteMenuItem(item: MenuItem): void {
    if (confirm(`Voulez-vous vraiment supprimer "${item.name}" du menu ?`)) {
      if (!item.id) return;
      this.menuItemService.deleteMenuItem(item.id).subscribe({
        next: () => {
          this.menuItems.update(list => list.filter(i => i.id !== item.id));
          this.successMessage.set('Plat supprimé du menu.');
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors de la suppression du plat.');
          console.error(err);
        }
      });
    }
  }

  protected getCategoryBadgeClass(cat: string): string {
    switch (cat) {
      case 'STARTER': return 'bg-info-light text-info';
      case 'MAIN': return 'bg-primary-light text-primary';
      case 'DESSERT': return 'bg-warning-light text-warning';
      case 'BEVERAGE': return 'bg-success-light text-success';
      default: return 'bg-body-dark text-dark';
    }
  }

  protected getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'STARTER': return 'Entrée';
      case 'MAIN': return 'Plat Principal';
      case 'DESSERT': return 'Dessert';
      case 'BEVERAGE': return 'Boisson';
      default: return cat;
    }
  }
}
