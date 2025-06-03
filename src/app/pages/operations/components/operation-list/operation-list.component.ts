// pages/operations/components/operation-list/operation-list.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Operation, OperationListFilter } from '../../../../shared/models/operation.model';
import { OperationService } from '../../../service/operation.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { OPERATION_KEY } from '../../constants/constant';

export interface OperationListEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    operation?: Operation;
}

@Component({
    selector: 'app-operation-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        ConfirmDialogModule,
        TooltipModule,
        IconField,
        InputIcon
    ],
    templateUrl: './operation-list.component.html',
    styleUrls: ['./operation-list.component.scss']
})
export class OperationListComponent implements OnInit {
    @Output() operationEvent = new EventEmitter<OperationListEvent>();

    operations: Operation[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedStatus: boolean | null = null;

    // Options pour les dropdowns
    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    constructor(
        private readonly operationService: OperationService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadOperations();
    }

    loadOperations(): void {
        this.loading = true;

        const filter: OperationListFilter = {
            search: this.searchTerm || undefined,
            active: this.selectedStatus !== null ? this.selectedStatus : undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.operationService.getOperations(filter).subscribe({
            next: (response) => {
                this.operations = response.operations;
                this.totalRecords = response.total;
                this.loading = false;
                this.logger.debug(`${response.operations.length} opérations chargées`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des opérations', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadOperations();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadOperations();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadOperations();
    }


    onCreate(): void {
        console.log('🔄 onCreate() appelé dans OperationListComponent'); // Debug
        this.operationEvent.emit({ type: 'create' });
        console.log('📤 Événement create émis'); // Debug
    }

    onView(operation: Operation): void {
        console.log('🔄 onView() appelé pour:', operation.nom); // Debug
        this.operationEvent.emit({ type: 'view', operation });
        console.log('📤 Événement view émis'); // Debug
    }

    onEdit(operation: Operation): void {
        console.log('🔄 onEdit() appelé pour:', operation.nom); // Debug
        this.operationEvent.emit({ type: 'edit', operation });
        console.log('📤 Événement edit émis'); // Debug
    }


    onDelete(operation: Operation): void {
        this.confirmationService.confirm({
            key: OPERATION_KEY,
            message: `Êtes-vous sûr de vouloir supprimer l'opération "${operation.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteOperation(operation);
            }
        });
    }

    onToggleStatus(operation: Operation): void {
        const action = operation.active ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} l'opération "${operation.nom}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleOperationStatus(operation);
            }
        });
    }

    private deleteOperation(operation: Operation): void {
        this.operationService.deleteOperation(operation.id).subscribe({
            next: () => {
                this.messageService.add({
                    key: OPERATION_KEY,
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Opération "${operation.nom}" supprimée avec succès`
                });
                this.loadOperations();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleOperationStatus(operation: Operation): void {
        this.operationService.toggleOperationStatus(operation.id).subscribe({
            next: (updatedOperation) => {
                const status = updatedOperation.active ? 'activée' : 'désactivée';
                this.messageService.add({
                    key: OPERATION_KEY,
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Opération "${updatedOperation.nom}" ${status} avec succès`
                });
                this.loadOperations();
            },
            error: (error) => {
                this.logger.error('Erreur lors du changement de statut', error);
            }
        });
    }

    /**
     * Vérifie si des filtres sont actifs
     */
    hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedStatus !== null);
    }

    /**
     * Efface tous les filtres
     */
    clearFilters(): void {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.currentPage = 0;
        this.loadOperations();

        this.messageService.add({
            key: OPERATION_KEY,
            severity: 'info',
            summary: 'Filtres effacés',
            detail: 'Tous les filtres ont été supprimés'
        });
    }

    /**
     * Retourne le message d'état vide approprié
     */
    getEmptyMessage(): string {
        if (this.hasActiveFilters()) {
            return 'Aucune opération ne correspond à vos critères de recherche.';
        }
        return 'Aucune opération n\'a été enregistrée pour le moment.';
    }

    /**
     * Formate les devises
     */
    formatCurrency(amount: number, currency: string): string {
        if (currency === 'XOF') {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('XOF', 'XOF');
        } else {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }
    }

    protected readonly OPERATION_KEY = OPERATION_KEY;
}
