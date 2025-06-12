import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../core/services/logger.service';
import { Button } from 'primeng/button';
import { EXPENSE_CATEGORY_KEY } from './constants/constants';
import { ExpenseCategoryListComponent } from './components/expense-category-list/expense-category-list.component';
import { ExpenseCategory, ExpenseCategoryEvent } from '../../shared/models/expense-category.model';
import { ExpenseCategoryFormComponent } from './components/expense-category-form/expense-category-form.component';

@Component({
    selector: 'app-expense-category',
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        Button,
        ExpenseCategoryListComponent,
        ExpenseCategoryFormComponent,
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
    templateUrl: './expense-category.component.html',
    styleUrl: './expense-category.component.scss'
})
export class ExpenseCategoryComponent {// État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    @ViewChild(ExpenseCategoryListComponent) expenseCategoryListComponent: ExpenseCategoryListComponent | undefined;

    // Données
    selectedExpenseCategory: ExpenseCategory | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private logger: LoggerService
    ) {
    }

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie';
    }

    /**
     * Gestionnaire d'événements de la liste des companies
     */
    onExpenseCategoryEvent(event: ExpenseCategoryEvent): void {
        this.logger.debug('Événement compagnie reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.expenseCategory!);
                break;
            case 'view':
                this.openDetailDialog(event.expenseCategory!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedExpenseCategory = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de catégorie ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(expenseCategory: ExpenseCategory): void {
        this.selectedExpenseCategory = expenseCategory;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour la catégorie: ${expenseCategory.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(expenseCategory: ExpenseCategory): void {
        this.selectedExpenseCategory = expenseCategory;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour la catégorie: ${expenseCategory.nom}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(expenseCategory: ExpenseCategory): void {
        this.logger.info('Formulaire soumis avec succès', { id: expenseCategory.id, nom: expenseCategory.nom });
        this.closeFormDialog();
        // Le rafraîchissement de la liste est géré par le composant CompanyListComponent
        this.expenseCategoryListComponent?.loadExpenseCategories()
    }

    /**
     * Gestionnaire d'annulation du formulaire
     */
    onFormCancel(): void {
        this.logger.info('Formulaire annulé');
        this.closeFormDialog();
    }

    /**
     * Fermeture du dialog de formulaire
     */
    onFormDialogHide(): void {
        this.closeFormDialog();
    }

    /**
     * Ferme le dialog de formulaire
     */
    private closeFormDialog(): void {
        this.showFormDialog = false;
        this.selectedExpenseCategory = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de clic sur édition depuis les détails
     */
    onDetailEditClick(expenseCategory: ExpenseCategory): void {
        this.logger.info(`Passage des détails à l'édition pour: ${expenseCategory.nom}`);
        this.showDetailDialog = false;
        this.openEditDialog(expenseCategory);
    }

    /**
     * Gestionnaire de fermeture des détails
     */
    onDetailCloseClick(): void {
        this.closeDetailDialog();
    }

    /**
     * Fermeture du dialog de détails
     */
    onDetailDialogHide(): void {
        this.closeDetailDialog();
    }

    /**
     * Ferme le dialog de détails
     */
    private closeDetailDialog(): void {
        this.showDetailDialog = false;
        this.selectedExpenseCategory = null;
    }

    onCreate() {
        this.openCreateDialog();
    }

    protected readonly EXPENSE_CATEGORY_KEY = EXPENSE_CATEGORY_KEY;
}
