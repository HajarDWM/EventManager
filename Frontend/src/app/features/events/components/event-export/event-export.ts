import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExportPdfService, EventExportData } from '../../../../core/services/export-pdf.service';
import { MenuItem } from '../../../../core/services/menu-item.service';
import { EventTask } from '../../../../core/services/event-task.service';
import { Guest } from '../../../../core/services/guest.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-export',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-export.html',
  styleUrls: ['./event-export.scss']
})
export class EventExport implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly exportPdfService = inject(ExportPdfService);

  protected readonly today = new Date();
  protected readonly eventId = signal<number | null>(null);
  protected readonly exportData = signal<EventExportData | null>(null);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string>('');

  // Active Tab: 'kitchen' | 'guests' | 'tasks'
  protected readonly activeTab = signal<'kitchen' | 'guests' | 'tasks'>('kitchen');

  // Computed Accessors
  protected readonly event = computed<Event | null>(() => this.exportData()?.event || null);
  protected readonly guests = computed<Guest[]>(() => this.exportData()?.guests || []);
  protected readonly menuItems = computed<MenuItem[]>(() => this.exportData()?.menuItems || []);
  protected readonly tasks = computed<EventTask[]>(() => this.exportData()?.tasks || []);

  // Categorized Menu Items
  protected readonly starters = computed(() => this.menuItems().filter(m => m.category === 'STARTER'));
  protected readonly mains = computed(() => this.menuItems().filter(m => m.category === 'MAIN'));
  protected readonly desserts = computed(() => this.menuItems().filter(m => m.category === 'DESSERT'));
  protected readonly beverages = computed(() => this.menuItems().filter(m => m.category === 'BEVERAGE'));

  // Metrics
  protected readonly pricePerPerson = computed(() => {
    return this.menuItems().reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
  });

  protected readonly totalCateringBudget = computed(() => {
    const guestCount = this.event()?.guestCount || 0;
    return this.pricePerPerson() * guestCount;
  });

  protected readonly confirmedGuests = computed(() => this.guests().filter(g => g.status === 'CONFIRMED'));
  protected readonly pendingGuests = computed(() => this.guests().filter(g => g.status === 'PENDING'));
  protected readonly declinedGuests = computed(() => this.guests().filter(g => g.status === 'DECLINED'));

  protected readonly completedTasks = computed(() => this.tasks().filter(t => t.status === 'COMPLETED'));
  protected readonly pendingTasks = computed(() => this.tasks().filter(t => t.status !== 'COMPLETED'));

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.eventId.set(id);
      this.loadExportData(id);
    }
  }

  private loadExportData(id: number): void {
    this.isLoading.set(true);
    this.exportPdfService.getEventExportData(id).subscribe({
      next: (data) => {
        this.exportData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les données d\'exportation pour cet événement.');
        console.error(err);
      }
    });
  }

  protected setTab(tab: 'kitchen' | 'guests' | 'tasks'): void {
    this.activeTab.set(tab);
  }

  protected printDocument(): void {
    this.exportPdfService.triggerPrint();
  }
}
