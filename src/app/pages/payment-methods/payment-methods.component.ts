import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../core/services/logger.service';
import { Button } from 'primeng/button';
import { PaymentMethodListComponent } from './components/payment-method-list/payment-method-list.component';
import { PaymentMethod, PaymentMethodEvent } from './interfaces/payment-method.interface';
import { PAYMENT_METHOD_KEY } from './constants/constants';
import { PaymentMethodFormComponent } from './components/payment-method-form/payment-method-form.component';


@Component({
    selector: 'app-payment-methods',
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        Button,
        PaymentMethodListComponent,
        PaymentMethodFormComponent
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
    templateUrl: './payment-methods.component.html',
    styleUrl: './payment-methods.component.scss'
})
export class PaymentMethodsComponent {// État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    @ViewChild(PaymentMethodListComponent) paymentMethodList: PaymentMethodListComponent | undefined;

    // Données
    selectedPaymentMethod: PaymentMethod | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private logger: LoggerService
    ) {
    }

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier la méthode de paiement' : 'Nouvelle méthode de paiement';
    }

    /**
     * Gestionnaire d'événements de la liste des companies
     */
    onPaymentMethodEvent(event: PaymentMethodEvent): void {
        this.logger.debug('Événement méthode paiement reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.paymentMethod!);
                break;
            case 'view':
                this.openDetailDialog(event.paymentMethod!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedPaymentMethod = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de fournisseur ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(paymentMethod: PaymentMethod): void {
        this.selectedPaymentMethod = paymentMethod;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour le fournisseur: ${paymentMethod.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(paymentMethod: PaymentMethod): void {
        this.selectedPaymentMethod = paymentMethod;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour le fournisseur: ${paymentMethod.nom}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(paymentMethod: PaymentMethod): void {
        this.logger.info('Formulaire soumis avec succès', { id: paymentMethod.id, nom: paymentMethod.nom });
        this.closeFormDialog();

        // Le rafraîchissement de la liste est géré par le composant CompanyListComponent
        this.paymentMethodList?.loadPaymentMethods()
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
        this.selectedPaymentMethod = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de clic sur édition depuis les détails
     */
    onDetailEditClick(paymentMethod: PaymentMethod): void {
        this.logger.info(`Passage des détails à l'édition pour: ${paymentMethod.nom}`);
        this.showDetailDialog = false;
        this.openEditDialog(paymentMethod);
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
        this.selectedPaymentMethod = null;
    }

    onCreate() {
        this.openCreateDialog();
    }

    protected readonly PAYMENT_METHOD_KEY = PAYMENT_METHOD_KEY;
}
