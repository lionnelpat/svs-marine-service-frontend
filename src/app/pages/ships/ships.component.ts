// pages/ships/ships.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Ship } from '../../shared/models/ship.model';
import { ShipListComponent, ShipListEvent } from './components/ship-list/ship-list.component';
import { ShipFormComponent } from './components/ship-form/ship-form.component';
import { ShipDetailComponent } from './components/ship-detail/ship-detail.component';
import { LoggerService } from '../../core/services/logger.service';

@Component({
    selector: 'app-ships',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        ShipListComponent,
        ShipFormComponent,
        ShipDetailComponent
    ],
    templateUrl: './ships.component.html',
    styleUrl: './ships.component.scss'
})
export class ShipsComponent {
    // État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    // Données
    selectedShip: Ship | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private readonly logger: LoggerService
    ) {}

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier le navire' : 'Nouveau navire';
    }

    /**
     * Gestionnaire d'événements de la liste des navires
     */
    onShipEvent(event: ShipListEvent): void {
        this.logger.debug('Événement navire reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.ship!);
                break;
            case 'view':
                this.openDetailDialog(event.ship!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedShip = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de navire ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(ship: Ship): void {
        this.selectedShip = ship;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour le navire: ${ship.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(ship: Ship): void {
        this.selectedShip = ship;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour le navire: ${ship.nom}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(ship: Ship): void {
        this.logger.info('Formulaire soumis avec succès', { shipId: ship.id, nom: ship.nom });
        this.closeFormDialog();
        // Le rafraîchissement de la liste est géré par le composant ShipListComponent
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
        this.selectedShip = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de clic sur édition depuis les détails
     */
    onDetailEditClick(ship: Ship): void {
        this.logger.info(`Passage des détails à l'édition pour: ${ship.nom}`);
        this.showDetailDialog = false;
        this.openEditDialog(ship);
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
        this.selectedShip = null;
    }
}
