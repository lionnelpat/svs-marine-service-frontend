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
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import {
    ExpenseCategory,
    ExpenseCategoryEvent,
    ExpenseCategoryListFilter
} from '../../../../shared/models/expense-category.model';
import { ExpenseCategoryListEvent } from '../../../../shared/models/expense.model';
import { ExpenseCategoryService } from '../../service/expense-category.service';


@Component({
    selector: 'app-expense-category-list',
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
    templateUrl: './expense-category-list.component.html',
    styleUrl: './expense-category-list.component.scss'
})

export class ExpenseCategoryListComponent implements OnInit {
    @Output() expenseCategoryEvent = new EventEmitter<ExpenseCategoryEvent>();

    expenseCategories: ExpenseCategory[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedCountry: string | null = null;
    selectedStatus: boolean | null = null;

    // Options pour les dropdowns
    countryOptions = [
        { label: 'Sénégal', value: 'Sénégal' },
        { label: 'France', value: 'France' },
        { label: 'Danemark', value: 'Danemark' },
        { label: 'Suisse', value: 'Suisse' },
        { label: 'Chine', value: 'Chine' },
        { label: 'Allemagne', value: 'Allemagne' },
        { label: 'Singapour', value: 'Singapour' }
    ];

    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    constructor(
        private readonly expenseCategoryService: ExpenseCategoryService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadExpenseCategories();
    }

    loadExpenseCategories(): void {
        this.loading = true;

        const filter: ExpenseCategoryListFilter = {
            search: this.searchTerm || undefined,
            active: this.selectedStatus ?? undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.expenseCategoryService.getCategories(filter).subscribe({
            next: (resp) => {
                console.log(resp);
                this.expenseCategories = resp.data.categories;
                this.totalRecords = resp.data.total;
                this.currentPage = resp.data.page;
                this.pageSize = resp.data.size;
                this.loading = false;
                this.logger.debug(`${resp.data.total} catégories chargées`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des catégories', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadExpenseCategories();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadExpenseCategories();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadExpenseCategories();
    }

    onCreate(): void {
        this.expenseCategoryEvent.emit({ type: 'create' });
    }

    onEdit(expenseCategory: ExpenseCategory): void {
        this.expenseCategoryEvent.emit({ type: 'edit', expenseCategory });
    }

    onDelete(expenseCategory: ExpenseCategory): void {
        this.confirmationService.confirm({
            key: 'delete',
            message: `Êtes-vous sûr de vouloir supprimer la catégorie "${expenseCategory.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteExpenseCategory(expenseCategory);
            }
        });
    }

    onToggleStatus(expenseCategory: ExpenseCategory): void {
        const action = expenseCategory.active ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} la catégorie "${expenseCategory.nom}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleExpenseCategoryStatus(expenseCategory);
            }
        });
    }

    private deleteExpenseCategory(expenseCategory: ExpenseCategory): void {
        this.expenseCategoryService.deleteCategory(expenseCategory.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${expenseCategory.nom}" supprimée avec succès`
                });
                this.loadExpenseCategories();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleExpenseCategoryStatus(expenseCategory: ExpenseCategory): void {
        this.expenseCategoryService.toggleCategoryStatus(expenseCategory.id).subscribe({
            next: (updatedExpenseCategory) => {
                const status = updatedExpenseCategory.active ? 'activée' : 'désactivée';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${updatedExpenseCategory.nom}" ${status} avec succès`
                });
                this.loadExpenseCategories();
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
        this.loadExpenseCategories();

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
            return 'Aucune catégorie ne correspond à vos critères de recherche.';
        }
        return 'Aucune catégorie n\'a été enregistrée pour le moment.';
    }
}
