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
import { PaymentMethod, PaymentMethodEvent, PaymentMethodFilter } from '../../interfaces/payment-method.interface';
import { PaymentMethodService } from '../../service/payment-method.service';


@Component({
    selector: 'app-payment-method-list',
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
    templateUrl: './payment-method-list.component.html',
    styleUrl: './payment-method-list.component.scss'
})

export class PaymentMethodListComponent implements OnInit {
    @Output() paymentMethodEvent = new EventEmitter<PaymentMethodEvent>();

    paymentMethods: PaymentMethod[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedStatus: boolean | null = null;

    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadPaymentMethods();
    }

    loadPaymentMethods(): void {
        this.loading = true;

        const filter: PaymentMethodFilter = {
            query: this.searchTerm || undefined,
            active: this.selectedStatus ?? undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.paymentMethodService.getPaymentMethods(filter).subscribe({
            next: (resp) => {
                console.log(resp.data.paymentMethods);
                this.paymentMethods = resp.data.paymentMethods;
                this.totalRecords = resp.data.totalElements;
                this.currentPage = resp.data.currentPage;     // ✅ correction
                this.pageSize = resp.data.size;
                this.loading = false;
                this.logger.debug(`${resp.data.totalElements} methodes de paiement chargées`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des methodes de paiement', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadPaymentMethods();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadPaymentMethods();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadPaymentMethods();
    }

    onCreate(): void {
        this.paymentMethodEvent.emit({ type: 'create' });
    }

    onEdit(paymentMethod: PaymentMethod): void {
        this.paymentMethodEvent.emit({ type: 'edit', paymentMethod });
    }

    onDelete(paymentMethod: PaymentMethod): void {
        this.confirmationService.confirm({
            key: 'delete',
            message: `Êtes-vous sûr de vouloir supprimer la methode de paiement "${paymentMethod.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deletePaymentMethod(paymentMethod);
            }
        });
    }

    onToggleStatus(expenseCategory: PaymentMethod): void {
        const action = expenseCategory.actif ? 'désactiver' : 'activer';
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

    private deletePaymentMethod(paymentMethod: PaymentMethod): void {
        this.paymentMethodService.deletePaymentMethod(paymentMethod.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${paymentMethod.nom}" supprimée avec succès`
                });
                this.loadPaymentMethods();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleExpenseSupplierStatus(paymentMethod: PaymentMethod): void {
        this.paymentMethodService.togglePaymentMethodStatus(paymentMethod.id).subscribe({
            next: (updatedPaymentMethod) => {
                const status = updatedPaymentMethod.actif ? 'activée' : 'désactivée';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${updatedPaymentMethod.nom}" ${status} avec succès`
                });
                this.loadPaymentMethods();
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
        this.loadPaymentMethods();

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
            return 'Aucune méthode de paiement ne correspond à vos critères de recherche.';
        }
        return 'Aucune méthode de paiement n\'a été enregistrée pour le moment.';
    }
}

