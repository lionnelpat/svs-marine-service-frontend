import { Routes } from '@angular/router';
import { PaymentMethodsComponent } from './payment-methods.component';


export const paymentMethodRoutes: Routes = [
    {
        path: '',
        component: PaymentMethodsComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: PaymentMethodsComponent,
                data: { view: 'list' }
            },
            {
                path: 'new',
                component: PaymentMethodsComponent,
                data: { view: 'form', mode: 'create' }
            },
            {
                path: ':id',
                component: PaymentMethodsComponent,
                data: { view: 'detail' }
            },
            {
                path: ':id/edit',
                component: PaymentMethodsComponent,
                data: { view: 'form', mode: 'edit' }
            }
        ]
    }
]
