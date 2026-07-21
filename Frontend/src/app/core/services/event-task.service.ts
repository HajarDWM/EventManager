import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventTask {
  id?: number;
  eventId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | string;
  assignedTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventTaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  public getTasksByEvent(eventId: number): Observable<EventTask[]> {
    return this.http.get<EventTask[]>(`${this.baseUrl}/events/${eventId}/tasks`);
  }

  public createEventTask(eventId: number, task: EventTask): Observable<EventTask> {
    return this.http.post<EventTask>(`${this.baseUrl}/events/${eventId}/tasks`, task);
  }

  public updateEventTask(id: number, task: EventTask): Observable<EventTask> {
    return this.http.put<EventTask>(`${this.baseUrl}/tasks/${id}`, task);
  }

  public toggleTaskStatus(id: number): Observable<EventTask> {
    return this.http.patch<EventTask>(`${this.baseUrl}/tasks/${id}/toggle`, {});
  }

  public deleteEventTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }
}
