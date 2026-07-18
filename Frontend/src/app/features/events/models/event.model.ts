export interface Event {
  id?: number;
  title: string;
  eventDate: string;
  location: string;
  guestCount: number;
  status?: 'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  catererId?: number;
}
