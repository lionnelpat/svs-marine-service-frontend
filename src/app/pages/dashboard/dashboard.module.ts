import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

// Dashboard Components
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardService } from '../service/dashboard.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        DashboardRoutingModule,

        // PrimeNG Modules
        CardModule,
        ChartModule,
        SkeletonModule,
        TagModule,
        ButtonModule,
        ProgressSpinnerModule,
        DividerModule,

        // Standalone Component
        DashboardComponent
    ],
    providers: [
        DashboardService
    ]
})
export class DashboardModule { }
