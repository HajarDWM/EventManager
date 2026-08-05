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
  protected readonly mealType = signal<string>('PLATS_FIXES');
  protected readonly masterCateringMode = signal<'BUFFET' | 'PLATS_FIXES' | 'MIX'>('PLATS_FIXES');

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

  protected readonly selectedDiets = signal<Record<string, boolean>>({});
  protected readonly customDietNotes = signal<string>('');
  
  protected readonly isAutocompleteOpen = signal<boolean>(false);

  protected readonly commonDietaryOptions = [
    { label: 'Végétarien', value: 'Végétarien', isCritical: false },
    { label: 'Vegan', value: 'Vegan', isCritical: false },
    { label: 'Sans Gluten', value: 'Sans Gluten', isCritical: false },
    { label: 'Sans Lactose', value: 'Sans Lactose', isCritical: false },
    { label: 'Sans Arachides (Alerte Médicale)', value: 'Sans Arachides', isCritical: true },
    { label: 'Halal', value: 'Halal', isCritical: false },
    { label: 'Sans Fruits de mer', value: 'Sans Fruits de mer', isCritical: false },
    { label: 'Sans Sucre', value: 'Sans Sucre', isCritical: false }
  ];

  protected readonly staticSuggestionsDetail: Record<string, { category: string, price: number, dietary: string }> = {
    "Foie gras de canard maison": { category: 'STARTER', price: 15, dietary: 'Sans Gluten' },
    "Saumon fumé et blinis": { category: 'STARTER', price: 12, dietary: 'Sans Arachides' },
    "Salade landaise": { category: 'STARTER', price: 10, dietary: 'Sans Porc' },
    "Velouté de cèpes": { category: 'STARTER', price: 8, dietary: 'Végétarien' },
    "Tartare de saumon avocat": { category: 'STARTER', price: 11, dietary: 'Sans Gluten' },
    "Filet de bœuf sauce morilles": { category: 'MAIN', price: 28, dietary: '' },
    "Magret de canard au miel": { category: 'MAIN', price: 24, dietary: 'Sans Porc' },
    "Dos de cabillaud sauce vierge": { category: 'MAIN', price: 22, dietary: 'Sans Arachides' },
    "Risotto aux truffes": { category: 'MAIN', price: 20, dietary: 'Végétarien, Sans Gluten' },
    "Suprême de volaille": { category: 'MAIN', price: 18, dietary: '' },
    "Tarte Tatin et crème fraîche": { category: 'DESSERT', price: 7, dietary: 'Végétarien' },
    "Moelleux au chocolat": { category: 'DESSERT', price: 6.5, dietary: 'Végétarien' },
    "Crème brûlée vanille Bourbon": { category: 'DESSERT', price: 6, dietary: 'Végétarien, Sans Gluten' },
    "Mille-feuille": { category: 'DESSERT', price: 7.5, dietary: 'Végétarien' },
    "Café gourmand": { category: 'DESSERT', price: 8, dietary: 'Végétarien' },
    "Champagne Brut": { category: 'BEVERAGE', price: 9, dietary: 'Vegan, Sans Gluten' },
    "Vin rouge AOC": { category: 'BEVERAGE', price: 6, dietary: 'Vegan, Sans Gluten' },
    "Vin blanc Chardonnay": { category: 'BEVERAGE', price: 6.5, dietary: 'Vegan, Sans Gluten' },
    "Eau minérale": { category: 'BEVERAGE', price: 3, dietary: 'Vegan, Sans Gluten' },
    "Softs et jus de fruits": { category: 'BEVERAGE', price: 4, dietary: 'Vegan, Sans Gluten' },
    "Buffet de fromages affinés": { category: 'OTHER', price: 12, dietary: 'Végétarien, Sans Gluten' },
    "Assortiment de pièces cocktail": { category: 'OTHER', price: 25, dietary: '' },
    "Buffet de desserts": { category: 'OTHER', price: 15, dietary: 'Végétarien' },
    "Atelier découpe de jambon serrano": { category: 'OTHER', price: 18, dietary: 'Sans Gluten, Sans Lactose' }
  };

  protected readonly globalMenuItems = signal<MenuItem[]>([]);

  protected readonly mergedSuggestionsDetail = computed(() => {
    const map: Record<string, { category: string, price: number, dietary: string, description?: string }> = {};
    
    // First populate with static template suggestions
    Object.entries(this.staticSuggestionsDetail).forEach(([name, details]) => {
      map[name] = details;
    });

    // Merge in dynamically saved menu items from database
    this.globalMenuItems().forEach(item => {
      map[item.name] = {
        category: item.category,
        price: item.pricePerPerson,
        dietary: item.dietaryTag || '',
        description: item.description
      };
    });

    return map;
  });

  protected readonly mergedSuggestions = computed(() => {
    return Object.keys(this.mergedSuggestionsDetail());
  });

  protected readonly filteredSuggestions = computed(() => {
    const term = this.name().toLowerCase().trim();
    const suggestions = this.mergedSuggestions();
    if (!term) {
      return suggestions;
    }
    return suggestions.filter(s => s.toLowerCase().includes(term));
  });

  protected readonly dishSuggestions = computed(() => {
    const existingNames = this.menuItems().map(item => item.name);
    const combined = [...new Set([...existingNames, ...this.mergedSuggestions()])];
    return combined.sort();
  });

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

  protected readonly otherCount = computed(() => {
    return this.menuItems().filter(i => i.category === 'OTHER').length;
  });

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.eventId.set(id);
      this.loadEventData(id);
      this.loadMenuItems(id);
      this.loadCatererMenuItems();
    }
  }

  private loadCatererMenuItems(): void {
    this.menuItemService.getCatererMenuItems().subscribe({
      next: (items) => {
        this.globalMenuItems.set(items);
      },
      error: (err) => console.error('Erreur chargement catalogue global', err)
    });
  }

  private loadEventData(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        if (data.mealType) {
          this.mealType.set(data.mealType);
          const t = data.mealType;
          if (t.includes('BUFFET_ENTREES') && t.includes('PLATS_FIXES')) {
            this.masterCateringMode.set('MIX');
          } else if (t.startsWith('BUFFET') || t.includes('BUFFET_STANDARD')) {
            this.masterCateringMode.set('BUFFET');
          } else if (t === 'BUFFET') {
            this.masterCateringMode.set('BUFFET');
          } else {
            this.masterCateringMode.set('PLATS_FIXES');
          }
        }
      },
      error: (err) => console.error('Erreur chargement événement', err)
    });
  }

  protected selectMasterMode(mode: 'BUFFET' | 'PLATS_FIXES' | 'MIX'): void {
    this.masterCateringMode.set(mode);
    let defaultType = '';
    if (mode === 'BUFFET') {
      defaultType = 'BUFFET_STANDARD,BUFFET_VEG';
    } else if (mode === 'PLATS_FIXES') {
      defaultType = 'PLATS_FIXES,COURSE_MAIN';
    } else if (mode === 'MIX') {
      defaultType = 'BUFFET_ENTREES,PLATS_FIXES';
    }
    this.saveMealType(defaultType);
  }

  protected readonly availableFormats = [
    { label: 'Entrées sous forme de Buffet', value: 'BUFFET_ENTREES', icon: 'fa-cheese' },
    { label: 'Plat principal servi à table', value: 'PLATS_FIXES', icon: 'fa-concierge-bell' },
    { label: 'Buffet de Desserts', value: 'BUFFET_DESSERTS', icon: 'fa-birthday-cake' },
    { label: 'Buffet Végétarien & Halal', value: 'BUFFET_REGIMES', icon: 'fa-seedling' }
  ];

  protected isFormatSelected(value: string): boolean {
    const current = this.mealType() || '';
    return current.split(',').map(s => s.trim()).includes(value);
  }

  protected toggleFormat(value: string): void {
    const currentList = (this.mealType() || '').split(',').map(s => s.trim()).filter(Boolean);
    const index = currentList.indexOf(value);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(value);
    }
    const newMealType = currentList.join(',');
    this.saveMealType(newMealType);
  }

  protected saveMealType(newType: string): void {
    const currentEvent = this.event();
    if (!currentEvent || !this.eventId()) return;

    this.mealType.set(newType);
    this.eventService.updateEvent(this.eventId()!, {
      ...currentEvent,
      mealType: newType
    }).subscribe({
      next: (updated) => {
        this.event.set(updated);
        this.successMessage.set('Formats de restauration mis à jour avec succès !');
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la mise à jour des formats de restauration.');
        console.error(err);
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
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
    this.selectedDiets.set({});
    this.customDietNotes.set('');
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

    // Parse dietaryTag
    const dietsMap: Record<string, boolean> = {};
    const tags = (item.dietaryTag || '').split(',').map(t => t.trim()).filter(Boolean);
    const standardValues = this.commonDietaryOptions.map(o => o.value);
    const customNotesList: string[] = [];

    for (const tag of tags) {
      if (standardValues.includes(tag)) {
        dietsMap[tag] = true;
      } else {
        customNotesList.push(tag);
      }
    }

    this.selectedDiets.set(dietsMap);
    this.customDietNotes.set(customNotesList.join(', '));
    this.description.set(item.description || '');
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected toggleDiet(value: string, checked: boolean): void {
    this.selectedDiets.update(map => ({
      ...map,
      [value]: checked
    }));
  }

  protected onAutocompleteFocusOut(): void {
    setTimeout(() => {
      this.isAutocompleteOpen.set(false);
    }, 200);
  }

  protected selectSuggestion(suggestion: string): void {
    this.name.set(suggestion);
    this.isAutocompleteOpen.set(false);

    // Auto-select category, price, dietary, and description from merged details
    const detail = this.mergedSuggestionsDetail()[suggestion];
    if (detail) {
      this.category.set(detail.category);
      this.pricePerPerson.set(detail.price);
      if (detail.description) {
        this.description.set(detail.description);
      }

      // Parse and check the dietary checkboxes
      const dietsMap: Record<string, boolean> = {};
      const tags = detail.dietary.split(',').map(t => t.trim()).filter(Boolean);
      const standardValues = this.commonDietaryOptions.map(o => o.value);
      const customNotesList: string[] = [];

      for (const tag of tags) {
        if (standardValues.includes(tag)) {
          dietsMap[tag] = true;
        } else {
          customNotesList.push(tag);
        }
      }

      this.selectedDiets.set(dietsMap);
      this.customDietNotes.set(customNotesList.join(', '));
    }
  }

  protected onNameChange(newName: string): void {
    this.name.set(newName);

    // Check if the input matches any known suggestion
    const detail = this.mergedSuggestionsDetail()[newName];
    if (detail) {
      this.category.set(detail.category);
      this.pricePerPerson.set(detail.price);
      if (detail.description) {
        this.description.set(detail.description);
      }

      // Parse and check the dietary checkboxes
      const dietsMap: Record<string, boolean> = {};
      const tags = detail.dietary.split(',').map(t => t.trim()).filter(Boolean);
      const standardValues = this.commonDietaryOptions.map(o => o.value);
      const customNotesList: string[] = [];

      for (const tag of tags) {
        if (standardValues.includes(tag)) {
          dietsMap[tag] = true;
        } else {
          customNotesList.push(tag);
        }
      }

      this.selectedDiets.set(dietsMap);
      this.customDietNotes.set(customNotesList.join(', '));
    }
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

    // Reconstruct dietaryTag from checkboxes and custom notes
    const activeDiets = Object.entries(this.selectedDiets())
      .filter(([_, checked]) => checked)
      .map(([value]) => value);

    if (this.customDietNotes().trim()) {
      activeDiets.push(this.customDietNotes().trim());
    }

    const assembledDietaryTag = activeDiets.join(', ');

    const payload: MenuItem = {
      name: this.name().trim(),
      category: this.category(),
      pricePerPerson: this.pricePerPerson() || 0,
      dietaryTag: assembledDietaryTag,
      description: this.description().trim()
    };

    if (this.isEditing() && this.editingItemId()) {
      this.menuItemService.updateMenuItem(this.editingItemId()!, payload).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.menuItems.update(list => list.map(i => i.id === updated.id ? updated : i));
          this.loadCatererMenuItems();
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
          this.loadCatererMenuItems();
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
      case 'OTHER': return 'bg-secondary-light text-secondary';
      default: return 'bg-body-dark text-dark';
    }
  }

  protected getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'STARTER': return 'Entrée';
      case 'MAIN': return 'Plat Principal';
      case 'DESSERT': return 'Dessert';
      case 'BEVERAGE': return 'Boisson';
      case 'OTHER': return 'Autre';
      default: return cat;
    }
  }
}
