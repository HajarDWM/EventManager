import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Login } from './core/auth/login/login';
import { Register } from './core/auth/register/register';
import { authGuard } from './core/auth/guards/auth.guard';
import { EventList } from './features/events/components/event-list/event-list';
import { EventCreate } from './features/events/components/event-create/event-create';
import { EventEdit } from './features/events/components/event-edit/event-edit';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
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
        path: 'profile',
        component: Profile
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
