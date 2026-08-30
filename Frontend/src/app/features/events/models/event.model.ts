export interface Event {
  id?: number;
  title: string;
  eventDate: string;
  location: string;
  locationMapUrl?: string;
  guestCount?: number | null;
  status?: 'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  catererId?: number;
  clientId?: number;
  accessLinkToken?: string;
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
