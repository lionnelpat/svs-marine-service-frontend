import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { EmptyComponent } from './empty/empty.component';

export default [
    { path: 'crud', component: Crud },
    { path: 'empty', component: EmptyComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
