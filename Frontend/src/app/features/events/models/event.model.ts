export interface Event {
  id?: number;
  title: string;
  eventDate: string;
  location: string;
  guestCount?: number | null;
  status?: 'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  catererId?: number;
}
