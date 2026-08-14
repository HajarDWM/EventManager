export interface Event {
  id?: number;
  title: string;
  eventDate: string;
  location: string;
  guestCount?: number | null;
  status?: 'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  catererId?: number;
  digitalTemplateId?: number;
  invitationToken?: string;
  invitationTitle?: string;
  invitationSubtitle?: string;
  invitationDate?: string;
  invitationLocation?: string;
  parkingLocation?: string;
  mealType?: string;
  templateId?: string;
  isPaidEvent?: boolean;
  ticketPrice?: number;
  currency?: string;
}
