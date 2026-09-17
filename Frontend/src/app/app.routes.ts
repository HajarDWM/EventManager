import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Login } from './core/auth/login/login';
import { Register } from './core/auth/register/register';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { EventList } from './features/events/components/event-list/event-list';
import { EventCreate } from './features/events/components/event-create/event-create';
import { EventEdit } from './features/events/components/event-edit/event-edit';
import { GuestList } from './features/events/components/guest-list/guest-list';
import { MenuList } from './features/events/components/menu-list/menu-list';
import { TaskList } from './features/events/components/task-list/task-list';
import { EventExport } from './features/events/components/event-export/event-export';
import { Profile } from './features/profile';
import { adminGuard } from './core/auth/guards/admin.guard';
import { AdminDashboard } from './features/admin/dashboard/admin-dashboard';
import { AdminCatererList } from './features/admin/caterers/admin-caterer-list';
import { AdminCatererDetail } from './features/admin/caterers/admin-caterer-detail';
import { AdminBillingSettings } from './features/admin/billing/admin-billing-settings';
import { PendingApproval } from './core/auth/pending-approval/pending-approval';
import { Pricing } from './features/pricing/pricing';
import { SubscriptionComponent } from './features/subscription/subscription';
import { AdminTemplates } from './features/admin/templates/admin-templates';
import { OrganiserInvitationSetup } from './features/events/components/organiser-invitation-setup/organiser-invitation-setup';
import { AdminTransactions } from './features/admin/transactions/admin-transactions';
import { GuestRsvp } from './features/events/components/guest-rsvp/guest-rsvp';
import { EventDetails } from './features/events/components/event-details/event-details';
import { EventBilling } from './features/events/components/event-billing/event-billing';
import { ClientLogin } from './core/auth/client-login/client-login';
import { ClientLayout } from './core/client-layout/client-layout';
import { ClientDashboard } from './features/client-dashboard/client-dashboard';
import { ClientGuestList } from './features/client-guest-list/client-guest-list';
import { ClientMenuList } from './features/client-menu-list/client-menu-list';
import { clientGuard } from './core/auth/guards/client.guard';
import { ClientInvitationPreview } from './features/client-invitation-preview/client-invitation-preview';
import { ClientProfile } from './features/client-profile/client-profile';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'pending-approval',
    component: PendingApproval
  },
  {
    path: 'rsvp/:id',
    component: GuestRsvp
  },
  {
    path: 'template-preview-frame',
    loadComponent: () => import('./features/template-preview-frame/template-preview-frame').then(m => m.TemplatePreviewFrame)
  },
  {
    path: 'client/login',
    component: ClientLogin
  },
  {
    path: 'client',
    component: ClientLayout,
    canActivate: [clientGuard],
    children: [
      {
        path: 'dashboard',
        component: ClientDashboard
      },
      {
        path: 'events/:id/guests',
        component: ClientGuestList
      },
      {
        path: 'profile',
        component: ClientProfile
      },
      {
        path: 'events/:id/menu',
        component: ClientMenuList
      },
      {
        path: 'events/:id/invitation-preview',
        component: ClientInvitationPreview
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'events',
        component: EventList
      },
      {
        path: 'events/create',
        component: EventCreate
      },
      {
        path: 'events/edit/:id',
        component: EventEdit
      },
      {
        path: 'events/:id',
        component: EventDetails
      },
      {
        path: 'events/:id/billing',
        component: EventBilling
      },
      {
        path: 'events/:id/guests',
        component: GuestList
      },
      {
        path: 'events/:id/menu',
        component: MenuList
      },
      {
        path: 'events/:id/tasks',
        component: TaskList
      },
      {
        path: 'events/:id/export',
        component: EventExport
      },
      {
        path: 'events/:id/invitation-setup',
        component: OrganiserInvitationSetup
      },
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'pricing',
        component: Pricing
      },
      {
        path: 'subscription',
        component: SubscriptionComponent
      },
      {
        path: 'admin/dashboard',
        component: AdminDashboard,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/caterers',
        component: AdminCatererList,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/caterers/:id',
        component: AdminCatererDetail,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/invitations',
        redirectTo: 'admin/templates',
        pathMatch: 'full'
      },
      {
        path: 'admin/templates',
        component: AdminTemplates,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/billing',
        component: AdminBillingSettings,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/transactions',
        component: AdminTransactions,
        canActivate: [adminGuard]
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'events'
  }
];
