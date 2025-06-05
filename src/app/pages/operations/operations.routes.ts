import { Routes } from '@angular/router';
import { OperationListComponent } from './components/operation-list/operation-list.component';
import { OperationsComponent } from './operations.component';


export default [
    { path: 'list', component: OperationsComponent },
] as Routes;
