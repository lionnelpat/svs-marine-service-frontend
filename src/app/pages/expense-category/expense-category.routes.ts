import { Routes } from '@angular/router';
import { ExpenseCategoryComponent } from './expense-category.component';


export const expenseCategoryRoutes: Routes = [
    {
        path: '',
        component: ExpenseCategoryComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: ExpenseCategoryComponent,
                data: { view: 'list' }
            },
            {
                path: 'new',
                component: ExpenseCategoryComponent,
                data: { view: 'form', mode: 'create' }
            },
            {
                path: ':id',
                component: ExpenseCategoryComponent,
                data: { view: 'detail' }
            },
            {
                path: ':id/edit',
                component: ExpenseCategoryComponent,
                data: { view: 'form', mode: 'edit' }
            }
        ]
    }
]
