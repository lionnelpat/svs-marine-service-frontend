import { Routes } from '@angular/router';
import { ExpenseSupplierComponent } from './expense-supplier.component';


export const expenseSupplierRoutes: Routes = [
    {
        path: '',
        component: ExpenseSupplierComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: ExpenseSupplierComponent,
                data: { view: 'list' }
            },
            {
                path: 'new',
                component: ExpenseSupplierComponent,
                data: { view: 'form', mode: 'create' }
            },
            {
                path: ':id',
                component: ExpenseSupplierComponent,
                data: { view: 'detail' }
            },
            {
                path: ':id/edit',
                component: ExpenseSupplierComponent,
                data: { view: 'form', mode: 'edit' }
            }
        ]
    }
]
