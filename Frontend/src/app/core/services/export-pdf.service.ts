import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../../features/events/models/event.model';
import { Guest } from './guest.service';
import { MenuItem } from './menu-item.service';
import { EventTask } from './event-task.service';

export interface EventExportData {
  event: Event;
  guests: Guest[];
  menuItems: MenuItem[];
  tasks: EventTask[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  public getEventExportData(eventId: number): Observable<EventExportData> {
    return this.http.get<EventExportData>(`${this.baseUrl}/events/${eventId}/export-data`);
  }

  public triggerPrint(): void {
    window.print();
  }
}
