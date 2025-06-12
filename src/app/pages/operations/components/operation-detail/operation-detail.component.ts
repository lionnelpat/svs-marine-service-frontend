// pages/operations/components/operation-detail/operation-detail.component.ts
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { Operation } from '../../../../shared/models/operation.model';
import { OperationService } from '../../../service/operation.service';
import { CurrencyUtils } from '../../../../shared/utils';

@Component({
    selector: 'app-operation-detail',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TagModule,
        DividerModule,
        AvatarModule
    ],
    templateUrl: './operation-detail.component.html',
    styleUrls: ['./operation-detail.component.scss'],
})
export class OperationDetailComponent {
    @Input() operation: Operation | null = null;
    @Output() editClick = new EventEmitter<Operation>();
    @Output() closeClick = new EventEmitter<void>();

   readonly operationService = inject(OperationService);

    formatDate(date: Date): string {
        if (!date) return '';

        const dateObj = new Date(date);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }

    formatCurrency(amount: number | undefined, currency: string): string {
        return CurrencyUtils.formatCurrency(amount, currency);
    }

    getExchangeRate(): string {
        return this.operationService.getExchangeRate().toString();
    }

    onEdit(): void {
        if (this.operation) {
            this.editClick.emit(this.operation);
        }
    }

    onClose(): void {
        this.closeClick.emit();
    }
}
