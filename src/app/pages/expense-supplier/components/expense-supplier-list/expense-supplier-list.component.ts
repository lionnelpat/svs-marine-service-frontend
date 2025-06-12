import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import {
    ExpenseSupplier,
    ExpenseSupplierEvent,
    ExpenseSupplierListFilter
} from '../../interfaces/expense-supplier.interface';
import { ExpenseSupplierService } from '../../service/expense-supplier.service';


@Component({
    selector: 'app-expense-supplier-list',
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
    providers: [ConfirmationService, MessageService],
    standalone: true,
    templateUrl: './expense-supplier-list.component.html',
    styleUrl: './expense-supplier-list.component.scss'
})

export class ExpenseSupplierListComponent implements OnInit {
    @Output() expenseSupplierEvent = new EventEmitter<ExpenseSupplierEvent>();

    expenseSuppliers: ExpenseSupplier[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedCountry: string | null = null;
    selectedStatus: boolean | null = null;

    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    constructor(
        private readonly expenseSupplierService: ExpenseSupplierService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadExpenseSuppliers();
    }

    loadExpenseSuppliers(): void {
        this.loading = true;

        const filter: ExpenseSupplierListFilter = {
            search: this.searchTerm || undefined,
            active: this.selectedStatus ?? undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.expenseSupplierService.getSuppliers(filter).subscribe({
            next: (resp) => {
                console.log(resp);
                this.expenseSuppliers = resp.data.suppliers;
                this.totalRecords = resp.data.total;
                this.currentPage = resp.data.page;
                this.pageSize = resp.data.size;
                this.loading = false;
                this.logger.debug(`${resp.data.total} fournisseurs chargées`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des fournisseurs', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadExpenseSuppliers();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadExpenseSuppliers();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadExpenseSuppliers();
    }

    onCreate(): void {
        this.expenseSupplierEvent.emit({ type: 'create' });
    }

    onEdit(expenseSupplier: ExpenseSupplier): void {
        this.expenseSupplierEvent.emit({ type: 'edit', expenseSupplier });
    }

    onDelete(expenseCategory: ExpenseSupplier): void {
        this.confirmationService.confirm({
            key: 'delete',
            message: `Êtes-vous sûr de vouloir supprimer la catégorie "${expenseCategory.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteExpenseSupplier(expenseCategory);
            }
        });
    }

    onToggleStatus(expenseCategory: ExpenseSupplier): void {
        const action = expenseCategory.active ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} la catégorie "${expenseCategory.nom}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleExpenseSupplierStatus(expenseCategory);
            }
        });
    }

    private deleteExpenseSupplier(expenseSupplier: ExpenseSupplier): void {
        this.expenseSupplierService.deleteSupplier(expenseSupplier.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${expenseSupplier.nom}" supprimée avec succès`
                });
                this.loadExpenseSuppliers();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleExpenseSupplierStatus(expenseSupplier: ExpenseSupplier): void {
        this.expenseSupplierService.toggleSupplierStatus(expenseSupplier.id).subscribe({
            next: (updatedExpenseSupplier) => {
                const status = updatedExpenseSupplier.active ? 'activée' : 'désactivée';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${updatedExpenseSupplier.nom}" ${status} avec succès`
                });
                this.loadExpenseSuppliers();
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
        this.loadExpenseSuppliers();

        this.messageService.add({
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
            return 'Aucun fournisseur ne correspond à vos critères de recherche.';
        }
        return 'Aucun fournisseur n\'a été enregistrée pour le moment.';
    }
}

