import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientMenuService } from '../../core/services/client-menu.service';
import { MenuItem } from '../../core/services/menu-item.service';

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
  
  protected readonly eventId = signal<number | null>(null);
  protected readonly menuItems = signal<MenuItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Grouped items
  protected readonly groupedItems = computed(() => {
    const items = this.menuItems();
    return {
      STARTER: items.filter(i => i.category === 'STARTER'),
      MAIN: items.filter(i => i.category === 'MAIN'),
      DESSERT: items.filter(i => i.category === 'DESSERT'),
      BEVERAGE: items.filter(i => i.category === 'BEVERAGE')
    };
  });

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
