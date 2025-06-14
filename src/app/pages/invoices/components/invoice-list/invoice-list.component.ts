// src/app/pages/invoices/components/invoice-list/invoice-list.component.ts

import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

// Models
import {
    Invoice,
    INVOICE_STATUS_LABELS,
    InvoiceListFilter,
    InvoiceStatus
} from '../../../../shared/models/invoice.model';
import { MOCK_COMPANIES } from '../../../../shared/data/invoice.data';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Subject, takeUntil } from 'rxjs';
import { ExpenseListFilter } from '../../../../shared/models/expense.model';
import { InvoiceService } from '../../../service/invoice.service';
import { CompanyService } from '../../../service/company.service';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        InputTextModule,
        TagModule,
        MenuModule,
        TooltipModule,
        ProgressSpinnerModule,
        PaginatorModule,
        IconField,
        InputIcon
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './invoice-list.component.html',
    styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
    @Input() invoices: Invoice[] = [];
    @Input() loading = false;
    @Input() totalRecords = 0;

    @Output() onView = new EventEmitter<Invoice>();
    @Output() onEdit = new EventEmitter<Invoice>();
    @Output() onDelete = new EventEmitter<Invoice>();
    @Output() onStatusChange = new EventEmitter<{ invoice: Invoice; status: InvoiceStatus }>();
    @Output() onFilter = new EventEmitter<InvoiceListFilter>();
    @Output() onExport = new EventEmitter<'excel' | 'pdf'>();
    @Output() onPageChange = new EventEmitter<any>();

    private readonly invoiceService = inject(InvoiceService)
    private readonly companyService = inject(CompanyService)
    private readonly messageService = inject(MessageService)
    private readonly confirmationService = inject(ConfirmationService)

    // Variables de recherche et filtres
    searchTerm = '';
    selectedCompany: number | null = null;
    selectedStatus: InvoiceStatus | null = null;

    selectedPeriodType: 'day' | 'month' | 'year' | 'range' | null = null;
    selectedDate: Date | null = null;
    selectedMonth: number | null = null;
    selectedYear: number | null = null;
    dateRange: Date[] | null = null;

    // Options pour les filtres de date
    periodTypeOptions = [
        { label: 'Jour', value: 'day' },
        { label: 'Mois', value: 'month' },
        { label: 'Année', value: 'year' },
        { label: 'Période', value: 'range' }
    ];

    monthOptions = [
        { label: 'Janvier', value: 1 },
        { label: 'Février', value: 2 },
        { label: 'Mars', value: 3 },
        { label: 'Avril', value: 4 },
        { label: 'Mai', value: 5 },
        { label: 'Juin', value: 6 },
        { label: 'Juillet', value: 7 },
        { label: 'Août', value: 8 },
        { label: 'Septembre', value: 9 },
        { label: 'Octobre', value: 10 },
        { label: 'Novembre', value: 11 },
        { label: 'Décembre', value: 12 }
    ];

    yearOptions: { label: string; value: number }[] = [];

    // Variables de pagination
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 }
    ];

    // Options pour les dropdowns
    companyOptions: { label: string; value: number }[] = [];
    statusOptions: { label: string; value: InvoiceStatus }[] = [];

    // Timeout pour la recherche
    private searchTimeout: any;

    // Subject pour la gestion de la destruction du composant
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initializeOptions();
    }

    private initializeOptions(): void {

        this.companyService.getCompanies().subscribe((resp) => {
            // Options des compagnies
            this.companyOptions = [
                { label: 'Toutes les compagnies', value: 0 },
                ...resp.companies.map(company => ({
                    label: company.nom,
                    value: company.id
                }))
            ];
        })


        // Options des statuts
        this.statusOptions = Object.values(InvoiceStatus).map(status => ({
            label: INVOICE_STATUS_LABELS[status],
            value: status
        }));

        // Options des années (5 dernières années + année actuelle + 2 prochaines)
        const currentYear = new Date().getFullYear();
        this.yearOptions = [];
        for (let year = currentYear - 5; year <= currentYear + 2; year++) {
            this.yearOptions.push({
                label: year.toString(),
                value: year
            });
        }
    }

    loadInvoices(){
        this.invoiceService.getInvoices().subscribe((resp) => {
            this.invoices = resp.invoices;
        })
    }

    // Gestion de la recherche et des filtres
    onSearchInputChange(): void {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    applyFilters(): void {
        const filter: InvoiceListFilter = {
            page: 0,
            size: this.pageSize
        };

        if (this.searchTerm?.trim()) {
            filter.search = this.searchTerm.trim();
        }

        if (this.selectedCompany && this.selectedCompany > 0) {
            filter.compagnieId = this.selectedCompany;
        }

        if (this.selectedStatus) {
            filter.statut = this.selectedStatus;
        }

        if (this.selectedPeriodType) {
            switch (this.selectedPeriodType) {
                case 'day':
                    if (this.selectedDate) {
                        const startOfDay = new Date(this.selectedDate);
                        startOfDay.setHours(0, 0, 0, 0);
                        const endOfDay = new Date(this.selectedDate);
                        endOfDay.setHours(23, 59, 59, 999);

                        filter.dateDebut = startOfDay;
                        filter.dateFin = endOfDay;
                    }
                    break;

                case 'month':
                    if (this.selectedMonth && this.selectedYear) {
                        const startOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
                        const endOfMonth = new Date(this.selectedYear, this.selectedMonth, 0, 23, 59, 59, 999);

                        filter.dateDebut = startOfMonth;
                        filter.dateFin = endOfMonth;
                        filter.mois = this.selectedMonth;
                        filter.annee = this.selectedYear;
                    } else if (this.selectedMonth) {
                        filter.mois = this.selectedMonth;
                    } else if (this.selectedYear) {
                        filter.annee = this.selectedYear;
                    }
                    break;

                case 'year':
                    if (this.selectedYear) {
                        const startOfYear = new Date(this.selectedYear, 0, 1);
                        const endOfYear = new Date(this.selectedYear, 11, 31, 23, 59, 59, 999);

                        filter.dateDebut = startOfYear;
                        filter.dateFin = endOfYear;
                        filter.annee = this.selectedYear;
                    }
                    break;

                case 'range':
                    if (this.dateRange && this.dateRange.length === 2) {
                        const startDate = new Date(this.dateRange[0]);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(this.dateRange[1]);
                        endDate.setHours(23, 59, 59, 999);

                        filter.dateDebut = startDate;
                        filter.dateFin = endDate;
                    }
                    break;
            }
        }

        this.currentPage = 0;
        this.onFilter.emit(filter);
    }

    // Gestion de la pagination
    onPageSizeChange(): void {
        this.currentPage = 0;
        this.applyFilters();
    }

    // Gestion des changements de type de période
    onPeriodTypeChange(): void {
        // Réinitialiser les valeurs de date quand on change de type
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;

        // Appliquer les filtres pour rafraîchir immédiatement
        this.applyFilters();
    }

    // Réinitialiser tous les filtres et relancer le chargement
    resetAllFilters(): void {
        // Réinitialiser la recherche
        this.searchTerm = '';

        // Réinitialiser les filtres de base
        this.selectedCompany = null;
        this.selectedStatus = null;

        // Réinitialiser les filtres de date
        this.selectedPeriodType = null;
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;

        // Réinitialiser la pagination
        this.currentPage = 0;
        this.pageSize = 10;

        // Annuler le timeout de recherche en cours s'il existe
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }

        // Relancer le chargement avec les filtres vides
        this.loadInvoices();
    }

    // Réinitialiser uniquement les filtres de date
    resetDateFilters(): void {
        this.selectedPeriodType = null;
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;
        this.applyFilters();
    }

    // Gestion de la pagination
    onLazyLoadChange(event: any): void {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.onPageChange.emit(event);
    }

    previousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.emitPageChange();
        }
    }

    nextPage(): void {
        if (this.hasNextPage()) {
            this.currentPage++;
            this.emitPageChange();
        }
    }

    hasNextPage(): boolean {
        return (this.currentPage + 1) * this.pageSize < this.totalRecords;
    }

    private emitPageChange(): void {
        this.onPageChange.emit({
            first: this.currentPage * this.pageSize,
            rows: this.pageSize
        });
    }

    // Actions sur les factures
    viewInvoice(invoice: Invoice): void {
        this.onView.emit(invoice);
    }

    editInvoice(invoice: Invoice): void {
        this.onEdit.emit(invoice);
    }

    deleteInvoice(invoice: Invoice): void {
        this.onDelete.emit(invoice);
    }

    // Menu contextuel
    showMenu(event: Event, invoice: Invoice, menu: any): void {
        menu.toggle(event);
    }

    getMenuItems(invoice: Invoice): MenuItem[] {
        return [
            {
                label: 'Marquer comme émise',
                icon: 'pi pi-send',
                disabled: invoice.statut === InvoiceStatus.EMISE ||
                    invoice.statut === InvoiceStatus.PAYEE,
                command: () => this.changeStatus(invoice, InvoiceStatus.EMISE)
            },
            {
                label: 'Marquer comme payée',
                icon: 'pi pi-check',
                disabled: invoice.statut === InvoiceStatus.PAYEE,
                command: () => this.changeStatus(invoice, InvoiceStatus.PAYEE)
            },
            {
                separator: true
            },
            // {
            //     label: 'Imprimer',
            //     icon: 'pi pi-print',
            //     command: () => this.printInvoice(invoice)
            // },
            // {
            //     label: 'Dupliquer',
            //     icon: 'pi pi-copy',
            //     command: () => this.duplicateInvoice(invoice)
            // },
            {
                separator: true
            },
            {
                label: 'Supprimer',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.deleteInvoice(invoice)
            }
        ];
    }

    changeStatus(invoice: Invoice, status: InvoiceStatus): void {
        this.onStatusChange.emit({ invoice, status });
    }

    printInvoice(invoice: Invoice): void {
        // TODO: Implémenter l'impression
        console.log('Imprimer facture', invoice.id);
    }

    duplicateInvoice(invoice: Invoice): void {
        const duplicatedInvoice = {
            ...invoice,
            id: 0, // Nouvel ID
            numero: '', // Nouveau numéro sera généré
            statut: InvoiceStatus.BROUILLON,
            dateFacture: new Date(),
            dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        this.onEdit.emit(duplicatedInvoice);
    }

    private applyDateFilters(filter: InvoiceListFilter): void {
        if (!this.selectedPeriodType) return;

        switch (this.selectedPeriodType) {
            case 'day':
                if (this.selectedDate) {
                    const startOfDay = new Date(this.selectedDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(this.selectedDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    filter.dateDebut = startOfDay;
                    filter.dateFin = endOfDay;
                }
                break;

            case 'month':
                if (this.selectedMonth) {
                    filter.mois = this.selectedMonth;
                }
                if (this.selectedYear) {
                    filter.annee = this.selectedYear;
                }
                if (this.selectedMonth && this.selectedYear) {
                    const startOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
                    const endOfMonth = new Date(this.selectedYear, this.selectedMonth, 0, 23, 59, 59, 999);
                    filter.dateDebut = startOfMonth;
                    filter.dateFin = endOfMonth;
                }
                break;

            case 'year':
                if (this.selectedYear) {
                    filter.annee = this.selectedYear;
                    const startOfYear = new Date(this.selectedYear, 0, 1);
                    const endOfYear = new Date(this.selectedYear, 11, 31, 23, 59, 59, 999);
                    filter.dateDebut = startOfYear;
                    filter.dateFin = endOfYear;
                }
                break;

            case 'range':
                if (this.dateRange && this.dateRange.length === 2) {
                    const startDate = new Date(this.dateRange[0]);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(this.dateRange[1]);
                    endDate.setHours(23, 59, 59, 999);

                    filter.dateDebut = startDate;
                    filter.dateFin = endDate;
                }
                break;
        }
    }

    private buildFilter(): InvoiceListFilter {
        const filter: InvoiceListFilter = {
            page: this.currentPage,
            size: this.pageSize
        };

        if (this.searchTerm?.trim()) {
            filter.search = this.searchTerm.trim();
        }

        if (this.selectedCompany) {
            filter.compagnieId = this.selectedCompany;
        }


        if (this.selectedStatus) {
            filter.statut = this.selectedStatus;
        }

        // Gestion des filtres de date
        this.applyDateFilters(filter);

        return filter;
    }

    // Export
    exportToPdf(): void {
        const filter = this.buildFilter();

        this.invoiceService.exportToPdf(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `depenses-${new Date().toISOString().split('T')[0]}.pdf`;
                    link.click();
                    window.URL.revokeObjectURL(url);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Export PDF téléchargé avec succès'
                    });
                },
                error: (error) => {
                    console.error('Erreur lors de l\'export PDF', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible d\'exporter en PDF'
                    });
                }
            });
    }

    exportToExcel(): void {
        const filter = this.buildFilter();

        this.invoiceService.exportToExcel(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `depenses-${new Date().toISOString().split('T')[0]}.xlsx`;
                    link.click();
                    window.URL.revokeObjectURL(url);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Export Excel téléchargé avec succès'
                    });
                },
                error: (error) => {
                    console.error('Erreur lors de l\'export Excel', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible d\'exporter en Excel'
                    });
                }
            });
    }

    // Méthodes utilitaires
    getDisplayIndex(rowIndex: number): number {
        return this.currentPage * this.pageSize + rowIndex + 1;
    }

    getDisplayRange(): string {
        const start = this.currentPage * this.pageSize + 1;
        const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
        return `${start} à ${end}`;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }

    getStatusLabel(status: InvoiceStatus): string {
        return INVOICE_STATUS_LABELS[status];
    }

    getStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
        const severityMap: { [key in InvoiceStatus]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            [InvoiceStatus.BROUILLON]: 'secondary',
            [InvoiceStatus.EMISE]: 'info',
            [InvoiceStatus.PAYEE]: 'success',
            [InvoiceStatus.ANNULEE]: 'warning',
            [InvoiceStatus.EN_RETARD]: 'danger'
        };
        return severityMap[status];
    }

    getStatusClass(status: InvoiceStatus): string {
        return status === InvoiceStatus.ANNULEE ? 'status-inactif' : '';
    }

    isOverdue(invoice: Invoice): boolean {
        return invoice.statut !== InvoiceStatus.PAYEE &&
            invoice.statut !== InvoiceStatus.ANNULEE &&
            new Date() > new Date(invoice.dateEcheance);
    }
}
