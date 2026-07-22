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
import { AdminInvitationTemplates } from './features/admin/templates/admin-invitation-templates';
import { AdminBillingSettings } from './features/admin/billing/admin-billing-settings';

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
        path: 'profile',
        component: Profile
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
        path: 'admin/invitations',
        component: AdminInvitationTemplates,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/billing',
        component: AdminBillingSettings,
        canActivate: [adminGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
