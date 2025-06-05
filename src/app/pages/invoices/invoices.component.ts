// src/app/pages/invoices/invoices.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// Services
import { InvoiceService } from '../service/invoice.service';
import { LoggerService } from '../../core/services/logger.service';

// Models
import { Invoice, InvoiceListFilter, InvoiceStatus, INVOICE_STATUS_LABELS, INVOICE_STATUS_SEVERITIES } from '../../shared/models/invoice.model';

// Components
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';

@Component({
    selector: 'app-invoices',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        InvoiceFormComponent,
        InvoiceListComponent,
        InvoiceDetailComponent
    ],
    templateUrl: './invoices.component.html',
    styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit, OnDestroy {
    invoices: Invoice[] = [];
    selectedInvoice: Invoice | null = null;
    statistics: any = null;

    // États de l'interface
    loading = false;
    editMode = false;
    showFormModal = false;
    showDetailModal = false;
    totalRecords = 0;

    // Filtres actuels
    currentFilter: InvoiceListFilter = {
        page: 0,
        size: 10,
        active: true
    };

    private destroy$ = new Subject<void>();

    constructor(
        private readonly invoiceService: InvoiceService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadInvoices();
        this.loadStatistics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Chargement des données
    private loadInvoices(): void {
        this.loading = true;
        this.invoiceService.getInvoices(this.currentFilter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.invoices = response.invoices;
                    this.totalRecords = response.total;
                    this.loading = false;
                    this.logger.info('Factures chargées', { count: response.invoices.length });
                },
                error: (error) => {
                    this.loading = false;
                    this.logger.error('Erreur lors du chargement des factures', error);
                }
            });
    }

    private loadStatistics(): void {
        this.invoiceService.getStatistics()
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
    showNewInvoiceForm(): void {
        this.selectedInvoice = null;
        this.editMode = false;
        this.showFormModal = true;
    }

    closeFormModal(): void {
        this.showFormModal = false;
        this.selectedInvoice = null;
        this.editMode = false;
    }

    closeDetailModal(): void {
        this.showDetailModal = false;
        this.selectedInvoice = null;
    }

    // Gestion des actions sur les factures
    onViewInvoice(invoice: Invoice): void {
        this.selectedInvoice = invoice;
        this.showDetailModal = true;
        this.logger.info('Affichage détail facture', { id: invoice.id });
    }

    onEditInvoice(invoice: Invoice): void {
        this.selectedInvoice = { ...invoice };
        this.editMode = true;
        this.showFormModal = true;
        this.logger.info('Édition facture', { id: invoice.id });
    }

    onEditFromDetail(invoice: Invoice): void {
        this.closeDetailModal();
        this.onEditInvoice(invoice);
    }

    onDeleteInvoice(invoice: Invoice): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer la facture ${invoice.numero} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.invoiceService.deleteInvoice(invoice.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Facture supprimée avec succès'
                            });
                            this.loadInvoices();
                            this.loadStatistics();
                        }
                    });
            }
        });
    }

    onStatusChange(event: { invoice: Invoice; status: InvoiceStatus }): void {
        this.invoiceService.updateInvoiceStatus(event.invoice.id, event.status)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedInvoice) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Statut de la facture mis à jour'
                    });
                    this.loadInvoices();
                    this.loadStatistics();

                    // Mettre à jour la facture sélectionnée si c'est la même
                    if (this.selectedInvoice?.id === updatedInvoice.id) {
                        this.selectedInvoice = updatedInvoice;
                    }
                }
            });
    }

    // Gestion du formulaire
    onSaveInvoice(invoiceData: any): void {
        const operation = this.editMode ? 'mise à jour' : 'création';
        const serviceCall = this.editMode
            ? this.invoiceService.updateInvoice(invoiceData)
            : this.invoiceService.createInvoice(invoiceData);

        serviceCall
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (savedInvoice) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Facture ${this.editMode ? 'mise à jour' : 'créée'} avec succès`
                    });

                    this.loadInvoices();
                    this.loadStatistics();
                    this.closeFormModal();
                }
            });
    }

    // Gestion des filtres et pagination
    onFilterChange(filter: InvoiceListFilter): void {
        this.currentFilter = { ...this.currentFilter, ...filter, page: 0 };
        this.loadInvoices();
        this.logger.info('Filtre appliqué', filter);
    }

    onPageChange(event: any): void {
        this.currentFilter.page = event.first / event.rows;
        this.currentFilter.size = event.rows;
        this.loadInvoices();
    }

    // Export et impression
    onExportInvoices(format: 'excel' | 'pdf'): void {
        this.logger.info('Export demandé', { format });
        this.messageService.add({
            severity: 'info',
            summary: 'Export',
            detail: `Export ${format.toUpperCase()} en cours...`
        });
    }

    exportInvoices(): void {
        this.onExportInvoices('excel');
    }

    onPrintInvoice(invoice: Invoice): void {
        this.logger.info('Impression facture', { id: invoice.id });
        this.messageService.add({
            severity: 'info',
            summary: 'Impression',
            detail: 'Génération du PDF en cours...'
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
