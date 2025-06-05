import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            {
                path: 'companies',
                loadChildren: () => import('./app/pages/companies/companies.routes')
            },
            {
                path: 'invoices',
                loadChildren: () => import('./app/pages/invoices/invoices.routes')
            },
            {
                path: 'operations',
                loadChildren: () => import('./app/pages/operations/operations.routes')
            },
            {
                path: 'ships',
                loadChildren: () => import('./app/pages/ships/ships.routes')
            },
            {
                path: 'expenses',
                loadChildren: () => import('./app/pages/expenses/expenses.routes')
            }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
