// src/app/pages/expenses/expenses.component.ts

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitterModule } from 'primeng/splitter';

// Services
import { ExpenseService } from '../service/expense.service';
import { LoggerService } from '../../core/services/logger.service';

// Models
import {
    Expense,
    EXPENSE_STATUS_LABELS,
    ExpenseCreateRequest,
    ExpenseStatsResponse,
    ExpenseStatus,
    ExpenseStatusChangeRequest,
    ExpenseUpdateRequest
} from '../../shared/models/expense.model';

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
        DialogModule,
        TagModule,
        ToolbarModule,
        SplitterModule,
        ExpenseListComponent,
        ExpenseFormComponent,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit, OnDestroy {

    // Services injectés
    private readonly expenseService = inject(ExpenseService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly logger = inject(LoggerService);

    @ViewChild('ExpenseListComponent') expenseListComponent: ExpenseListComponent | undefined

    // Données du composant
    selectedExpense: Expense | null = null;
    selectedExpenses: Expense[] = [];
    statistics: ExpenseStatsResponse | null = null;

    // États de l'interface
    loading = false;
    editMode = false;
    showFormModal = false;
    showStatsPanel = true;

    // Modes d'affichage
    viewMode: 'list' | 'grid' | 'kanban' = 'list';
    selectionMode = false;

    // Subject pour la gestion de la destruction du composant
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadStatistics();
        this.logger.info('ExpensesComponent initialisé');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ========== Chargement des données ==========

    private loadStatistics(): void {
        this.expenseService.getExpenseStatistics()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.statistics = stats;
                    this.logger.debug('Statistiques chargées', stats);
                },
                error: (error) => {
                    this.logger.error('Erreur lors du chargement des statistiques', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les statistiques'
                    });
                }
            });
    }

    private refreshData(): void {
        this.loadStatistics();
        // La liste se rafraîchit automatiquement via le composant enfant
    }

    // ========== Gestion des modales ==========

    showNewExpenseForm(): void {
        this.selectedExpense = null;
        this.editMode = false;
        this.showFormModal = true;
        this.logger.info('Ouverture du formulaire de création');
    }

    closeFormModal(): void {
        this.showFormModal = false;
        this.selectedExpense = null;
        this.editMode = false;
        this.logger.debug('Fermeture du formulaire');
    }

    // ========== Gestion des actions sur les dépenses ==========

    onEditExpense(expense: Expense): void {
        // Vérifier si la dépense peut être modifiée
        if (!this.canEditExpense(expense)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Action non autorisée',
                detail: `Cette dépense ne peut pas être modifiée (statut: ${EXPENSE_STATUS_LABELS[expense.statut]})`
            });
            return;
        }

        this.selectedExpense = { ...expense };
        this.editMode = true;
        this.showFormModal = true;
        this.logger.info('Édition dépense', { id: expense.id, numero: expense.numero });
    }

    onDeleteExpense(expense: Expense): void {
        // Vérifier si la dépense peut être supprimée
        if (!this.canDeleteExpense(expense)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Action non autorisée',
                detail: `Cette dépense ne peut pas être supprimée (statut: ${EXPENSE_STATUS_LABELS[expense.statut]})`
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer la dépense "${expense.titre}" (${expense.numero}) ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteExpense(expense);
            }
        });
    }

    private deleteExpense(expense: Expense): void {
        this.expenseService.deleteExpense(expense.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dépense "${expense.numero}" supprimée avec succès`
                    });
                    this.refreshData();
                    this.logger.info('Dépense supprimée', { id: expense.id });
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la suppression', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de supprimer la dépense'
                    });
                }
            });
    }

    onStatusChange(event: { expense: Expense; status: ExpenseStatus }): void {
        const { expense, status } = event;

        // Vérifier la validité du changement de statut
        if (!this.canChangeStatus(expense, status)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Action non autorisée',
                detail: `Impossible de changer le statut vers "${EXPENSE_STATUS_LABELS[status]}"`
            });
            return;
        }

        // Demander confirmation pour le rejet
        if (status === ExpenseStatus.REJETEE) {
            this.confirmRejectExpense(expense);
            return;
        }

        // Créer la requête de changement de statut
        const statusChangeRequest: ExpenseStatusChangeRequest = {
            statut: status,
            commentaire: this.getDefaultStatusComment(status)
        };

        this.changeExpenseStatus(expense, statusChangeRequest);
    }

    private confirmRejectExpense(expense: Expense): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir rejeter la dépense "${expense.titre}" ?`,
            header: 'Confirmation de rejet',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, rejeter',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                const statusChangeRequest: ExpenseStatusChangeRequest = {
                    statut: ExpenseStatus.REJETEE,
                    commentaire: 'Dépense rejetée depuis la liste'
                };
                this.changeExpenseStatus(expense, statusChangeRequest);
            }
        });
    }

    private changeExpenseStatus(expense: Expense, request: ExpenseStatusChangeRequest): void {
        this.expenseService.changeExpenseStatus(expense.id, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedExpense) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Statut changé vers "${EXPENSE_STATUS_LABELS[request.statut]}"`
                    });
                    this.refreshData();
                    this.logger.info('Statut de dépense changé', {
                        id: expense.id,
                        oldStatus: expense.statut,
                        newStatus: request.statut
                    });
                },
                error: (error) => {
                    this.logger.error('Erreur lors du changement de statut', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de changer le statut'
                    });
                }
            });
    }

    // ========== Gestion du formulaire ==========

    onSaveExpense(expenseData: ExpenseCreateRequest | ExpenseUpdateRequest): void {
        const operation = this.editMode ? 'mise à jour' : 'création';

        if (this.editMode && this.selectedExpense) {
            this.updateExpense(this.selectedExpense.id, expenseData as ExpenseUpdateRequest);
        } else {
            this.createExpense(expenseData as ExpenseCreateRequest);
        }
    }

    private createExpense(expenseData: ExpenseCreateRequest): void {
        this.expenseService.createExpense(expenseData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (savedExpense) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dépense "${savedExpense.numero}" créée avec succès`
                    });
                    this.refreshData();
                    this.closeFormModal();
                    this.logger.info('Dépense créée', { id: savedExpense.id });
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la création', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de créer la dépense'
                    });
                }
            });
    }

    private updateExpense(id: number, expenseData: ExpenseUpdateRequest): void {
        this.expenseService.updateExpense(id, expenseData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedExpense) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dépense "${updatedExpense.numero}" mise à jour avec succès`
                    });
                    this.refreshData();
                    this.closeFormModal();
                    this.logger.info('Dépense mise à jour', { id: updatedExpense.id });
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la mise à jour', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de mettre à jour la dépense'
                    });
                }
            });
    }

    // ========== Gestion de la sélection ==========

    onSelectionChange(selectedExpenses: Expense[]): void {
        this.selectedExpenses = selectedExpenses;
        this.logger.debug('Sélection changée', { count: selectedExpenses.length });
    }

    toggleSelectionMode(): void {
        this.selectionMode = !this.selectionMode;
        this.selectedExpenses = [];
        this.logger.info('Mode sélection', { enabled: this.selectionMode });
    }

    // ========== Actions en lot ==========

    approveSelectedExpenses(): void {
        if (this.selectedExpenses.length === 0) return;

        const approvableExpenses = this.selectedExpenses.filter(expense =>
            this.canChangeStatus(expense, ExpenseStatus.APPROUVEE)
        );

        if (approvableExpenses.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune dépense sélectionnée ne peut être approuvée'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Approuver ${approvableExpenses.length} dépense(s) sélectionnée(s) ?`,
            header: 'Confirmation d\'approbation',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Oui, approuver',
            rejectLabel: 'Annuler',
            accept: () => {
                this.processBatchStatusChange(approvableExpenses, ExpenseStatus.APPROUVEE);
            }
        });
    }

    rejectSelectedExpenses(): void {
        if (this.selectedExpenses.length === 0) return;

        const rejectableExpenses = this.selectedExpenses.filter(expense =>
            this.canChangeStatus(expense, ExpenseStatus.REJETEE)
        );

        if (rejectableExpenses.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune dépense sélectionnée ne peut être rejetée'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Rejeter ${rejectableExpenses.length} dépense(s) sélectionnée(s) ?`,
            header: 'Confirmation de rejet',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, rejeter',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.processBatchStatusChange(rejectableExpenses, ExpenseStatus.REJETEE);
            }
        });
    }

    deleteSelectedExpenses(): void {
        if (this.selectedExpenses.length === 0) return;

        const deletableExpenses = this.selectedExpenses.filter(expense =>
            this.canDeleteExpense(expense)
        );

        if (deletableExpenses.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune dépense sélectionnée ne peut être supprimée'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Supprimer définitivement ${deletableExpenses.length} dépense(s) sélectionnée(s) ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.processBatchDelete(deletableExpenses);
            }
        });
    }

    private processBatchStatusChange(expenses: Expense[], status: ExpenseStatus): void {
        let processed = 0;
        let errors = 0;

        expenses.forEach(expense => {
            const request: ExpenseStatusChangeRequest = {
                statut: status,
                commentaire: `Changement en lot vers ${EXPENSE_STATUS_LABELS[status]}`
            };

            this.expenseService.changeExpenseStatus(expense.id, request)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        processed++;
                        this.checkBatchCompletion(processed, errors, expenses.length, 'changement de statut');
                    },
                    error: () => {
                        errors++;
                        this.checkBatchCompletion(processed, errors, expenses.length, 'changement de statut');
                    }
                });
        });
    }

    private processBatchDelete(expenses: Expense[]): void {
        let processed = 0;
        let errors = 0;

        expenses.forEach(expense => {
            this.expenseService.deleteExpense(expense.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        processed++;
                        this.checkBatchCompletion(processed, errors, expenses.length, 'suppression');
                    },
                    error: () => {
                        errors++;
                        this.checkBatchCompletion(processed, errors, expenses.length, 'suppression');
                    }
                });
        });
    }

    private checkBatchCompletion(processed: number, errors: number, total: number, operation: string): void {
        if (processed + errors === total) {
            if (errors === 0) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `${operation} en lot réussie (${processed}/${total})`
                });
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Partiellement réussi',
                    detail: `${operation} en lot: ${processed} réussies, ${errors} échouées`
                });
            }
            this.refreshData();
            this.selectedExpenses = [];
        }
    }

    // ========== Gestion de l'affichage ==========

    toggleStatsPanel(): void {
        this.showStatsPanel = !this.showStatsPanel;
    }

    changeViewMode(mode: 'list' | 'grid' | 'kanban'): void {
        this.viewMode = mode;
        this.logger.info('Mode d\'affichage changé', { mode });
    }

    // ========== Méthodes de validation ==========

    private canEditExpense(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.EN_ATTENTE || expense.statut === ExpenseStatus.REJETEE;
    }

    private canDeleteExpense(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.EN_ATTENTE || expense.statut === ExpenseStatus.REJETEE;
    }

    private canChangeStatus(expense: Expense, newStatus: ExpenseStatus): boolean {
        const currentStatus = expense.statut;

        switch (currentStatus) {
            case ExpenseStatus.EN_ATTENTE:
                return newStatus === ExpenseStatus.APPROUVEE || newStatus === ExpenseStatus.REJETEE;
            case ExpenseStatus.APPROUVEE:
                return newStatus === ExpenseStatus.PAYEE || newStatus === ExpenseStatus.EN_ATTENTE;
            case ExpenseStatus.REJETEE:
                return newStatus === ExpenseStatus.EN_ATTENTE;
            case ExpenseStatus.PAYEE:
                return newStatus === ExpenseStatus.EN_ATTENTE; // Cas exceptionnel
            default:
                return false;
        }
    }

    // ========== Méthodes utilitaires ==========

    private getDefaultStatusComment(status: ExpenseStatus): string {
        switch (status) {
            case ExpenseStatus.APPROUVEE:
                return 'Dépense approuvée depuis la liste';
            case ExpenseStatus.REJETEE:
                return 'Dépense rejetée depuis la liste';
            case ExpenseStatus.PAYEE:
                return 'Dépense marquée comme payée';
            case ExpenseStatus.EN_ATTENTE:
                return 'Dépense remise en attente';
            default:
                return '';
        }
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // ========== Getters pour le template ==========

    get hasSelectedExpenses(): boolean {
        return this.selectedExpenses.length > 0;
    }

    get selectedExpensesCount(): number {
        return this.selectedExpenses.length;
    }

    get canApproveSelection(): boolean {
        return this.selectedExpenses.some(expense =>
            this.canChangeStatus(expense, ExpenseStatus.APPROUVEE)
        );
    }

    get canRejectSelection(): boolean {
        return this.selectedExpenses.some(expense =>
            this.canChangeStatus(expense, ExpenseStatus.REJETEE)
        );
    }

    get canDeleteSelection(): boolean {
        return this.selectedExpenses.some(expense => this.canDeleteExpense(expense));
    }
}
