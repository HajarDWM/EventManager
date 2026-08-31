import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientMenuService } from '../../core/services/client-menu.service';
import { MenuItem } from '../../core/services/menu-item.service';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';

@Component({
  selector: 'app-client-menu-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-menu-list.html',
  styleUrls: ['./client-menu-list.scss']
})
export class ClientMenuList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientMenuService = inject(ClientMenuService);
  private readonly clientAuthService = inject(ClientAuthService);
  
  protected readonly eventId = signal<number | null>(null);
  
  protected readonly event = computed(() => {
    const id = this.eventId();
    if (!id) return null;
    return this.clientAuthService.clientEvents().find(e => e.id === id) || null;
  });
  protected readonly menuItems = signal<MenuItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  
  protected readonly selectedCategory = signal<string>('ALL');

  // Grouped items
  protected readonly groupedItems = computed(() => {
    const items = this.menuItems();
    const active = this.selectedCategory();
    
    // Filter items based on active category
    const filtered = active === 'ALL' ? items : items.filter(i => {
      if (active === 'STARTER') return i.category === 'STARTER' || i.category === 'BUFFET_STARTER';
      if (active === 'MAIN') return i.category === 'MAIN' || i.category === 'BUFFET_MAIN';
      if (active === 'DESSERT') return i.category === 'DESSERT' || i.category === 'BUFFET_DESSERT';
      if (active === 'BEVERAGE') return i.category === 'BEVERAGE';
      return false;
    });

    return {
      STARTER: filtered.filter(i => i.category === 'STARTER' || i.category === 'BUFFET_STARTER'),
      MAIN: filtered.filter(i => i.category === 'MAIN' || i.category === 'BUFFET_MAIN'),
      DESSERT: filtered.filter(i => i.category === 'DESSERT' || i.category === 'BUFFET_DESSERT'),
      BEVERAGE: filtered.filter(i => i.category === 'BEVERAGE'),
      OTHER: filtered.filter(i => i.category === 'OTHER')
    };
  });

  protected getMealTypeLabel(mealType: string | undefined): { label: string, icon: string, desc: string } {
    if (!mealType) return { label: 'Non défini', icon: 'fa-utensils', desc: '' };
    const modes = mealType.split(',').map(m => m.trim());
    
    if (modes.includes('MIX')) {
      return { label: 'Formule Combinée', icon: 'fa-blender', desc: 'Buffets & Service assis' };
    }
    if (modes.includes('PLATS_FIXES')) {
      return { label: 'Service à l\'assiette', icon: 'fa-concierge-bell', desc: 'Service à table' };
    }
    if (modes.includes('BUFFET')) {
      return { label: 'Formule Buffet', icon: 'fa-cheese', desc: 'Libre-service' };
    }
    
    return { label: mealType, icon: 'fa-utensils', desc: '' };
  }

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      this.eventId.set(parsedId);
      this.loadMenu(parsedId);
    } else {
      this.errorMessage.set('Identifiant d\'événement invalide.');
      this.isLoading.set(false);
    }
  }

  private loadMenu(eventId: number): void {
    this.isLoading.set(true);
    this.clientMenuService.getMenuItemsByEvent(eventId).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger le menu de cet événement.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
