import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../core/services/logger.service';
import { Button } from 'primeng/button';
import { ExpenseSupplierListComponent } from './components/expense-supplier-list/expense-supplier-list.component';
import { ExpenseSupplier, ExpenseSupplierEvent } from './interfaces/expense-supplier.interface';
import { EXPENSE_SUPPLIER_KEY } from './constants/constants';
import { ExpenseSupplierFormComponent } from './components/expense-supplier-form/expense-supplier-form.component';


@Component({
    selector: 'app-expense-supplier',
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        Button,
        ExpenseSupplierListComponent,
        ExpenseSupplierFormComponent
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
    templateUrl: './expense-supplier.component.html',
    styleUrl: './expense-supplier.component.scss'
})
export class ExpenseSupplierComponent {// État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    @ViewChild(ExpenseSupplierListComponent) expenseSupplierListComponent: ExpenseSupplierListComponent | undefined;

    // Données
    selectedExpenseSupplier: ExpenseSupplier | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private logger: LoggerService
    ) {
    }

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur';
    }

    /**
     * Gestionnaire d'événements de la liste des companies
     */
    onExpenseSupplierEvent(event: ExpenseSupplierEvent): void {
        this.logger.debug('Événement fournisseur reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.expenseSupplier!);
                break;
            case 'view':
                this.openDetailDialog(event.expenseSupplier!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedExpenseSupplier = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de fournisseur ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(expenseSupplier: ExpenseSupplier): void {
        this.selectedExpenseSupplier = expenseSupplier;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour le fournisseur: ${expenseSupplier.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(expenseSupplier: ExpenseSupplier): void {
        this.selectedExpenseSupplier = expenseSupplier;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour le fournisseur: ${expenseSupplier.nom}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(expenseSupplier: ExpenseSupplier): void {
        this.logger.info('Formulaire soumis avec succès', { id: expenseSupplier.id, nom: expenseSupplier.nom });
        this.closeFormDialog();

        // Le rafraîchissement de la liste est géré par le composant CompanyListComponent
        this.expenseSupplierListComponent?.loadExpenseSuppliers()
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
        this.selectedExpenseSupplier = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de clic sur édition depuis les détails
     */
    onDetailEditClick(expenseSupplier: ExpenseSupplier): void {
        this.logger.info(`Passage des détails à l'édition pour: ${expenseSupplier.nom}`);
        this.showDetailDialog = false;
        this.openEditDialog(expenseSupplier);
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
        this.selectedExpenseSupplier = null;
    }

    onCreate() {
        this.openCreateDialog();
    }

    protected readonly EXPENSE_SUPPLIER_KEY = EXPENSE_SUPPLIER_KEY;
}
