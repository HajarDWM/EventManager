import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventTaskService, EventTask } from '../../../../core/services/event-task.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-list.html'
})
export class TaskList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventTaskService = inject(EventTaskService);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal<number | null>(null);
  protected readonly event = signal<Event | null>(null);
  protected readonly tasks = signal<EventTask[]>([]);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly successMessage = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  // Status Filter
  protected readonly selectedStatus = signal<string>('ALL');

  // Modal State
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isEditing = signal<boolean>(false);
  protected readonly editingTaskId = signal<number | null>(null);

  // Form Fields
  protected readonly title = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly dueDate = signal<string>('');
  protected readonly priority = signal<string>('MEDIUM');
  protected readonly status = signal<string>('TODO');
  protected readonly assignedTo = signal<string>('');

  // Computed Metrics
  protected readonly filteredTasks = computed(() => {
    const list = this.tasks();
    const st = this.selectedStatus();
    if (st === 'ALL') return list;
    return list.filter(t => t.status === st);
  });

  protected readonly totalCount = computed(() => this.tasks().length);

  protected readonly completedCount = computed(() => {
    return this.tasks().filter(t => t.status === 'COMPLETED').length;
  });

  protected readonly inProgressCount = computed(() => {
    return this.tasks().filter(t => t.status === 'IN_PROGRESS').length;
  });

  protected readonly todoCount = computed(() => {
    return this.tasks().filter(t => t.status === 'TODO').length;
  });

  protected readonly highPriorityCount = computed(() => {
    return this.tasks().filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
  });

  protected readonly progressPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.eventId.set(id);
      this.loadEventData(id);
      this.loadTasks(id);
    }
  }

  private loadEventData(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (data) => this.event.set(data),
      error: (err) => console.error('Erreur chargement événement', err)
    });
  }

  protected loadTasks(id: number): void {
    this.isLoading.set(true);
    this.eventTaskService.getTasksByEvent(id).subscribe({
      next: (items) => {
        this.tasks.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les tâches de cet événement.');
        console.error(err);
      }
    });
  }

  protected openAddModal(): void {
    this.isEditing.set(false);
    this.editingTaskId.set(null);
    this.title.set('');
    this.description.set('');
    this.dueDate.set('');
    this.priority.set('MEDIUM');
    this.status.set('TODO');
    this.assignedTo.set('');
    this.isModalOpen.set(true);
  }

  protected openEditModal(task: EventTask): void {
    this.isEditing.set(true);
    this.editingTaskId.set(task.id || null);
    this.title.set(task.title || '');
    this.description.set(task.description || '');
    this.dueDate.set(task.dueDate || '');
    this.priority.set(task.priority || 'MEDIUM');
    this.status.set(task.status || 'TODO');
    this.assignedTo.set(task.assignedTo || '');
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected onToggleStatus(task: EventTask): void {
    if (!task.id) return;
    this.eventTaskService.toggleTaskStatus(task.id).subscribe({
      next: (updated) => {
        this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
      },
      error: (err) => console.error('Erreur basculement statut tâche', err)
    });
  }

  protected onSaveTask(): void {
    if (!this.title().trim()) {
      this.errorMessage.set('Le titre de la tâche est obligatoire.');
      return;
    }

    const currentEventId = this.eventId();
    if (!currentEventId) return;

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload: EventTask = {
      title: this.title().trim(),
      description: this.description().trim(),
      dueDate: this.dueDate() || undefined,
      priority: this.priority(),
      status: this.status(),
      assignedTo: this.assignedTo().trim()
    };

    if (this.isEditing() && this.editingTaskId()) {
      this.eventTaskService.updateEventTask(this.editingTaskId()!, payload).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.successMessage.set('Tâche modifiée avec succès !');
          this.closeModal();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de la modification de la tâche.');
          console.error(err);
        }
      });
    } else {
      this.eventTaskService.createEventTask(currentEventId, payload).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.tasks.update(list => [...list, created]);
          this.successMessage.set('Tâche ajoutée à la checklist !');
          this.closeModal();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Erreur lors de la création de la tâche.');
          console.error(err);
        }
      });
    }
  }

  protected onDeleteTask(task: EventTask): void {
    if (confirm(`Voulez-vous vraiment supprimer la tâche "${task.title}" ?`)) {
      if (!task.id) return;
      this.eventTaskService.deleteEventTask(task.id).subscribe({
        next: () => {
          this.tasks.update(list => list.filter(t => t.id !== task.id));
          this.successMessage.set('Tâche supprimée.');
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors de la suppression de la tâche.');
          console.error(err);
        }
      });
    }
  }

  protected getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'bg-danger-light text-danger';
      case 'MEDIUM': return 'bg-warning-light text-warning';
      case 'LOW': return 'bg-info-light text-info';
      default: return 'bg-body-dark text-dark';
    }
  }

  protected getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'Haute / Urgente';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Basse';
      default: return priority;
    }
  }

  protected getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success-light text-success';
      case 'IN_PROGRESS': return 'bg-primary-light text-primary';
      case 'TODO': return 'bg-secondary-light text-secondary';
      default: return 'bg-body-dark text-dark';
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminée';
      case 'IN_PROGRESS': return 'En cours';
      case 'TODO': return 'À faire';
      default: return status;
    }
  }
}
