import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CompanyListComponent } from './components/company-list/company-list.component';
import { CompanyFormComponent } from './components/company-form/company-form.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { LoggerService } from '../../core/services/logger.service';
import { CompanyListEvent } from '../../shared/interfaces/commons.interfaces';
import { Company } from '../../shared/models';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-companies',
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        CompanyListComponent,
        CompanyFormComponent,
        CompanyDetailComponent,
        Button
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent {// État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    // Données
    selectedCompany: Company | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private logger: LoggerService
    ) {
    }

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier la compagnie' : 'Nouvelle compagnie';
    }

    /**
     * Gestionnaire d'événements de la liste des companies
     */
    onCompanyEvent(event: CompanyListEvent): void {
        this.logger.debug('Événement compagnie reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.company!);
                break;
            case 'view':
                this.openDetailDialog(event.company!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedCompany = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de compagnie ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(company: Company): void {
        this.selectedCompany = company;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour la compagnie: ${company.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(company: Company): void {
        this.selectedCompany = company;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour la compagnie: ${company.nom}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(company: Company): void {
        this.logger.info('Formulaire soumis avec succès', { companyId: company.id, nom: company.nom });
        this.closeFormDialog();
        // Le rafraîchissement de la liste est géré par le composant CompanyListComponent
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
        this.selectedCompany = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de clic sur édition depuis les détails
     */
    onDetailEditClick(company: Company): void {
        this.logger.info(`Passage des détails à l'édition pour: ${company.nom}`);
        this.showDetailDialog = false;
        this.openEditDialog(company);
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
        this.selectedCompany = null;
    }

    onCreate() {
        this.openCreateDialog();
    }
}
