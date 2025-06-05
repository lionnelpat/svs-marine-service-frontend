// src/app/pages/expenses/expenses.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// Services
import { ExpenseService } from '../service/expense.service';
import { LoggerService } from '../../core/services/logger.service';

// Models
import { Expense, ExpenseListFilter, ExpenseStatus, EXPENSE_STATUS_LABELS } from '../../shared/models/expense.model';

// Components
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';

@Component({
    selector: 'app-expenses',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        ExpenseListComponent,
        ExpenseFormComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit, OnDestroy {
    expenses: Expense[] = [];
    selectedExpense: Expense | null = null;
    statistics: any = null;

    // États de l'interface
    loading = false;
    editMode = false;
    showFormModal = false;
    totalRecords = 0;

    // Filtres actuels
    currentFilter: ExpenseListFilter = {
        page: 0,
        size: 10
    };

    private destroy$ = new Subject<void>();

    constructor(
        private readonly expenseService: ExpenseService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadExpenses();
        this.loadStatistics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Chargement des données
    private loadExpenses(): void {
        this.loading = true;
        this.expenseService.getExpenses(this.currentFilter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.expenses = response.expenses;
                    this.totalRecords = response.total;
                    this.loading = false;
                    this.logger.info('Dépenses chargées', { count: response.expenses.length });
                },
                error: (error) => {
                    this.loading = false;
                    this.logger.error('Erreur lors du chargement des dépenses', error);
                }
            });
    }

    private loadStatistics(): void {
        this.expenseService.getStatistics()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.statistics = stats;
                    this.logger.debug('Statistiques chargées', stats);
                },
                error: (error) => {
                    this.logger.error('Erreur lors du chargement des statistiques', error);
                }
            });
    }

    // Gestion des modales
    showNewExpenseForm(): void {
        this.selectedExpense = null;
        this.editMode = false;
        this.showFormModal = true;
    }

    closeFormModal(): void {
        this.showFormModal = false;
        this.selectedExpense = null;
        this.editMode = false;
    }

    // Gestion des actions sur les dépenses
    onEditExpense(expense: Expense): void {
        this.selectedExpense = { ...expense };
        this.editMode = true;
        this.showFormModal = true;
        this.logger.info('Édition dépense', { id: expense.id });
    }

    onDeleteExpense(expense: Expense): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer la dépense "${expense.titre}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.expenseService.deleteExpense(expense.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Dépense supprimée avec succès'
                            });
                            this.loadExpenses();
                            this.loadStatistics();
                        }
                    });
            }
        });
    }

    onStatusChange(event: { expense: Expense; status: ExpenseStatus }): void {
        this.expenseService.updateExpenseStatus(event.expense.id, event.status)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedExpense) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Statut de la dépense mis à jour'
                    });
                    this.loadExpenses();
                    this.loadStatistics();
                }
            });
    }

    // Gestion du formulaire
    onSaveExpense(expenseData: any): void {
        const operation = this.editMode ? 'mise à jour' : 'création';
        const serviceCall = this.editMode
            ? this.expenseService.updateExpense(expenseData)
            : this.expenseService.createExpense(expenseData);

        serviceCall
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (savedExpense) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dépense ${this.editMode ? 'mise à jour' : 'créée'} avec succès`
                    });

                    this.loadExpenses();
                    this.loadStatistics();
                    this.closeFormModal();
                }
            });
    }

    // Gestion des filtres et pagination
    onFilterChange(filter: ExpenseListFilter): void {
        this.currentFilter = { ...this.currentFilter, ...filter, page: 0 };
        this.loadExpenses();
        this.logger.info('Filtre appliqué', filter);
    }

    onPageChange(event: any): void {
        this.currentFilter.page = event.first / event.rows;
        this.currentFilter.size = event.rows;
        this.loadExpenses();
    }

    // Export des données
    exportToExcel(): void {
        this.expenseService.getExpensesForExport(this.currentFilter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    // TODO: Implémenter l'export Excel avec une bibliothèque comme xlsx
                    this.logger.info('Export Excel demandé', { records: data.length });
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Export Excel',
                        detail: 'Export en cours...'
                    });
                }
            });
    }

    exportToPDF(): void {
        this.expenseService.getExpensesForExport(this.currentFilter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    // TODO: Implémenter l'export PDF avec jsPDF
                    this.logger.info('Export PDF demandé', { records: data.length });
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Export PDF',
                        detail: 'Export en cours...'
                    });
                }
            });
    }

    // Méthodes utilitaires
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }
}
