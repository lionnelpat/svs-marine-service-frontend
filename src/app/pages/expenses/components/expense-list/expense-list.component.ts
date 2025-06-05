// src/app/pages/expenses/components/expense-list/expense-list.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuItem } from 'primeng/api';

// Models
import {
    Expense,
    ExpenseListFilter,
    ExpenseStatus,
    PaymentMethod,
    Currency,
    EXPENSE_STATUS_LABELS,
    EXPENSE_STATUS_SEVERITIES,
    PAYMENT_METHOD_LABELS,
    CURRENCY_LABELS
} from '../../../../shared/models/expense.model';
import { MOCK_EXPENSE_CATEGORIES, MOCK_EXPENSE_SUPPLIERS } from '../../../../shared/data/expense.data';

@Component({
    selector: 'app-expense-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        InputTextModule,
        InputNumberModule,
        TagModule,
        MenuModule,
        TooltipModule,
        ProgressSpinnerModule,
        CheckboxModule
    ],
    templateUrl: './expense-list.component.html',
    styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
    @Input() expenses: Expense[] = [];
    @Input() loading = false;
    @Input() totalRecords = 0;

    @Output() onEdit = new EventEmitter<Expense>();
    @Output() onDelete = new EventEmitter<Expense>();
    @Output() onStatusChange = new EventEmitter<{ expense: Expense; status: ExpenseStatus }>();
    @Output() onFilter = new EventEmitter<ExpenseListFilter>();
    @Output() onPageChange = new EventEmitter<any>();

    // Variables de recherche et filtres
    searchTerm = '';
    selectedCategory: number | null = null;
    selectedStatus: ExpenseStatus | null = null;
    selectedPaymentMethod: PaymentMethod | null = null;

    // Variables de filtres par date
    selectedPeriodType: 'day' | 'month' | 'year' | 'range' | null = null;
    selectedDate: Date | null = null;
    selectedMonth: number | null = null;
    selectedYear: number | null = null;
    dateRange: Date[] | null = null;

    // Variables de filtres par montant
    minAmount: number | null = null;
    maxAmount: number | null = null;

    // Variables de pagination
    currentPage = 0;
    pageSize = 10;

    // Options pour les dropdowns
    categoryOptions: { label: string; value: number }[] = [];
    statusOptions: { label: string; value: ExpenseStatus }[] = [];
    paymentMethodOptions: { label: string; value: PaymentMethod }[] = [];
    supplierOptions: { label: string; value: number }[] = [];

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

    // Timeout pour la recherche
    private searchTimeout: any = null;
    private amountFilterTimeout: any = null;

    ngOnInit(): void {
        this.initializeOptions();
    }

    private initializeOptions(): void {
        // Options des catégories
        this.categoryOptions = MOCK_EXPENSE_CATEGORIES.map(category => ({
            label: category.nom,
            value: category.id
        }));

        // Options des statuts
        this.statusOptions = Object.values(ExpenseStatus).map(status => ({
            label: EXPENSE_STATUS_LABELS[status],
            value: status
        }));

        // Options des modes de paiement
        this.paymentMethodOptions = Object.values(PaymentMethod).map(method => ({
            label: PAYMENT_METHOD_LABELS[method],
            value: method
        }));

        // Options des fournisseurs
        this.supplierOptions = MOCK_EXPENSE_SUPPLIERS.map(supplier => ({
            label: supplier.nom,
            value: supplier.id
        }));

        // Options des années
        const currentYear = new Date().getFullYear();
        this.yearOptions = [];
        for (let year = currentYear - 5; year <= currentYear + 2; year++) {
            this.yearOptions.push({
                label: year.toString(),
                value: year
            });
        }
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

    onAmountFilterChange(): void {
        if (this.amountFilterTimeout) {
            clearTimeout(this.amountFilterTimeout);
        }

        this.amountFilterTimeout = setTimeout(() => {
            this.applyFilters();
        }, 500);
    }

    applyFilters(): void {
        const filter: ExpenseListFilter = {
            page: 0,
            size: this.pageSize
        };

        if (this.searchTerm?.trim()) {
            filter.search = this.searchTerm.trim();
        }

        if (this.selectedCategory) {
            filter.categorieId = this.selectedCategory;
        }

        if (this.selectedStatus) {
            filter.statut = this.selectedStatus;
        }

        if (this.selectedPaymentMethod) {
            filter.modePaiement = this.selectedPaymentMethod;
        }

        if (this.minAmount) {
            filter.montantMin = this.minAmount;
        }

        if (this.maxAmount) {
            filter.montantMax = this.maxAmount;
        }

        // Gestion des filtres de date
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

    onPeriodTypeChange(): void {
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;
        this.applyFilters();
    }

    resetAllFilters(): void {
        this.searchTerm = '';
        this.selectedCategory = null;
        this.selectedStatus = null;
        this.selectedPaymentMethod = null;
        this.selectedPeriodType = null;
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;
        this.minAmount = null;
        this.maxAmount = null;
        this.currentPage = 0;
        this.pageSize = 10;

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }

        if (this.amountFilterTimeout) {
            clearTimeout(this.amountFilterTimeout);
            this.amountFilterTimeout = null;
        }

        this.applyFilters();
    }

    // Gestion de la pagination
    onLazyLoadChange(event: any): void {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.onPageChange.emit(event);
    }

    // Actions sur les dépenses
    editExpense(expense: Expense): void {
        this.onEdit.emit(expense);
    }

    deleteExpense(expense: Expense): void {
        this.onDelete.emit(expense);
    }

    // Menu contextuel
    showMenu(event: Event, expense: Expense, menu: any): void {
        menu.toggle(event);
    }

    getMenuItems(expense: Expense): MenuItem[] {
        return [
            {
                label: 'Marquer comme approuvée',
                icon: 'pi pi-check',
                disabled: expense.statut === ExpenseStatus.APPROUVEE || expense.statut === ExpenseStatus.PAYEE,
                command: () => this.changeStatus(expense, ExpenseStatus.APPROUVEE)
            },
            {
                label: 'Marquer comme payée',
                icon: 'pi pi-dollar',
                disabled: expense.statut === ExpenseStatus.PAYEE,
                command: () => this.changeStatus(expense, ExpenseStatus.PAYEE)
            },
            {
                label: 'Rejeter',
                icon: 'pi pi-times',
                disabled: expense.statut === ExpenseStatus.REJETEE || expense.statut === ExpenseStatus.PAYEE,
                command: () => this.changeStatus(expense, ExpenseStatus.REJETEE)
            },
            {
                separator: true
            },
            {
                label: 'Dupliquer',
                icon: 'pi pi-copy',
                command: () => this.duplicateExpense(expense)
            },
            {
                separator: true
            },
            {
                label: 'Supprimer',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.deleteExpense(expense)
            }
        ];
    }

    changeStatus(expense: Expense, status: ExpenseStatus): void {
        this.onStatusChange.emit({ expense, status });
    }

    duplicateExpense(expense: Expense): void {
        const duplicatedExpense = {
            ...expense,
            id: 0,
            numero: '',
            statut: ExpenseStatus.EN_ATTENTE,
            dateDepense: new Date()
        };

        this.onEdit.emit(duplicatedExpense);
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

    getStatusLabel(status: ExpenseStatus): string {
        return EXPENSE_STATUS_LABELS[status];
    }

    getStatusSeverity(status: ExpenseStatus): "success" | "info" | "warn" | "danger" | "secondary" {
        const severityMap: { [key in ExpenseStatus]: 'success' | 'info' | 'warn' | 'danger' | 'secondary' } = {
            [ExpenseStatus.EN_ATTENTE]: 'warn',
            [ExpenseStatus.APPROUVEE]: 'success',
            [ExpenseStatus.REJETEE]: 'danger',
            [ExpenseStatus.PAYEE]: 'info'
        };
        return severityMap[status];
    }

    getPaymentMethodLabel(method: PaymentMethod): string {
        return PAYMENT_METHOD_LABELS[method];
    }
}
