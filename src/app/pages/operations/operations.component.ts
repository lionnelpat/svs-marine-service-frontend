import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Operation } from '../../shared/models/operation.model';
import { OperationListComponent, OperationListEvent } from './components/operation-list/operation-list.component';
import { OperationFormComponent } from './components/operation-form/operation-form.component';
import { OperationDetailComponent } from './components/operation-detail/operation-detail.component';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoggerService } from '../../core/services/logger.service';

@Component({
    selector: 'app-operations',
    standalone: true,
    imports: [
        CommonModule,
        OperationListComponent,
        OperationFormComponent,
        OperationDetailComponent,
        DialogModule,
        ToastModule,
        ConfirmDialogModule
    ],
    templateUrl: './operations.component.html',
    styleUrls: ['./operations.component.scss']
})
export class OperationsComponent {
    selectedOperation: Operation | null = null;

    showFormDialog = false;
    showDetailDialog = false;

    formDialogTitle = '';

    constructor(
        private readonly logger: LoggerService
    ) {
    }

    /**
     * Gère les événements provenant du composant enfant OperationListComponent
     */
    onOperationEvent(event: OperationListEvent): void {
        console.log('📥 Event reçu dans OperationsComponent', event);

        switch (event.type) {
            case 'create':
                this.selectedOperation = null;
                this.formDialogTitle = 'Créer une opération';
                this.showFormDialog = true;
                break;

            case 'edit':
                this.selectedOperation = event.operation ?? null;
                this.formDialogTitle = 'Modifier une opération';
                this.showFormDialog = true;
                break;

            case 'view':
                this.selectedOperation = event.operation ?? null;
                this.showDetailDialog = true;
                break;
        }
    }

    /**
     * Gère la fermeture du formulaire
     */
    onFormCancel(): void {
        this.showFormDialog = false;
    }

    onFormDialogHide(): void {
        this.showFormDialog = false;
    }

    /**
     * Gère la soumission du formulaire (création ou modification)
     */
    onFormSubmit(updatedOperation: Operation): void {
        this.showFormDialog = false;
        // Optionnel : rafraîchir la liste via un service ou événement global
    }

    /**
     * Gère la fermeture du dialog de détail
     */
    onDetailCloseClick(): void {
        this.showDetailDialog = false;
    }

    /**
     * Gère le clic sur modifier depuis la vue détail
     */
    onDetailEditClick(operation: Operation): void {
        this.selectedOperation = operation;
        this.formDialogTitle = 'Modifier une opération';
        this.showDetailDialog = false;
        this.showFormDialog = true;
    }

    onDetailDialogHide(): void {
        this.showDetailDialog = false;
    }
}
