// src/app/pages/expenses/components/expense-list/expense-list.component.ts

import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

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
import { MenuItem, MessageService } from 'primeng/api';

// Models et Services
import {
    Currency,
    DropdownOption,
    Expense,
    EXPENSE_STATUS_LABELS,
    ExpenseListFilter,
    ExpenseStatus
} from '../../../../shared/models/expense.model';
import { ExpenseService } from '../../../service/expense.service';
import { ExpenseCategoryService } from '../../../expense-category/service/expense-category.service';
import { ExpenseSupplierService } from '../../../expense-supplier/service/expense-supplier.service';
import { PaymentMethodService } from '../../../payment-methods/service/payment-method.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

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
        CheckboxModule,
        IconField,
        InputIcon
    ],
    templateUrl: './expense-list.component.html',
    styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit, OnDestroy {
    @Input() showFilters = true;
    @Input() showActions = true;
    @Input() selectionMode = false;

    @Output() onEdit = new EventEmitter<Expense>();
    @Output() onDelete = new EventEmitter<Expense>();
    @Output() onStatusChange = new EventEmitter<{ expense: Expense; status: ExpenseStatus }>();
    @Output() onSelectionChange = new EventEmitter<Expense[]>();

    // Services injectés
    private readonly expenseService = inject(ExpenseService);
    private readonly expenseCategoryService = inject(ExpenseCategoryService);
    private readonly expenseSupplierService = inject(ExpenseSupplierService);
    private readonly paymentMethodService = inject(PaymentMethodService);
    private readonly messageService = inject(MessageService);

    // Données du composant
    expenses: Expense[] = [];
    selectedExpenses: Expense[] = [];
    loading = false;
    totalRecords = 0;

    // Variables de recherche et filtres
    searchTerm = '';
    private searchSubject = new Subject<string>();

    selectedCategory: number | null = null;
    selectedSupplier: number | null = null;
    selectedStatus: ExpenseStatus | null = null;
    selectedPaymentMethod: number | null = null;

    // Variables de filtres par date
    selectedPeriodType: 'day' | 'month' | 'year' | 'range' | null = null;
    selectedDate: Date | null = null;
    selectedMonth: number | null = null;
    selectedYear: number | null = null;
    dateRange: Date[] | null = null;

    // Variables de filtres par montant
    minAmount: number | null = null;
    maxAmount: number | null = null;
    private amountFilterSubject = new Subject<void>();

    // Variables de pagination
    currentPage = 0;
    pageSize = 20;
    first = 0;

    // Options pour les dropdowns
    categoryOptions: DropdownOption[] = [];
    supplierOptions: DropdownOption[] = [];
    statusOptions: DropdownOption[] = [];
    paymentMethodOptions: DropdownOption[] = [];

    // Options pour les filtres de date
    periodTypeOptions: DropdownOption[] = [
        { label: 'Jour', value: 'day' },
        { label: 'Mois', value: 'month' },
        { label: 'Année', value: 'year' },
        { label: 'Période', value: 'range' }
    ];

    monthOptions: DropdownOption[] = [
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

    yearOptions: DropdownOption[] = [];

    // Subject pour la gestion de la destruction du composant
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initializeOptions();
        this.setupSearchDebounce();
        this.setupAmountFilterDebounce();
        this.loadExpenses();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeOptions(): void {
        // Options des catégories
        this.expenseCategoryService.getCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resp) => {
                    this.categoryOptions = resp.data.categories.map(category => ({
                        label: category.nom,
                        value: category.id
                    }));
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des catégories', error);
                }
            });

        // Options des fournisseurs
        this.expenseSupplierService.getSuppliers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (suppliers) => {
                    this.supplierOptions = suppliers.data.suppliers.map(supplier => ({
                        label: supplier.nom,
                        value: supplier.id
                    }));
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des fournisseurs', error);
                }
            });

        // Options des modes de paiement
        this.paymentMethodService.getPaymentMethods()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (methods) => {
                    this.paymentMethodOptions = methods.data.paymentMethods.map(method => ({
                        label: method.nom,
                        value: method.id
                    }));
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des modes de paiement', error);
                }
            });

        // Options des statuts
        this.statusOptions = Object.values(ExpenseStatus).map(status => ({
            label: EXPENSE_STATUS_LABELS[status],
            value: status
        }));

        // Options des années
        this.initializeYearOptions();
    }

    private initializeYearOptions(): void {
        const currentYear = new Date().getFullYear();
        this.yearOptions = [];
        for (let year = currentYear - 5; year <= currentYear + 2; year++) {
            this.yearOptions.push({
                label: year.toString(),
                value: year
            });
        }
    }

    private setupSearchDebounce(): void {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.applyFilters();
        });
    }

    private setupAmountFilterDebounce(): void {
        this.amountFilterSubject.pipe(
            debounceTime(500),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.applyFilters();
        });
    }

    // ========== Gestion de la recherche et des filtres ==========

    onSearchInputChange(): void {
        this.searchSubject.next(this.searchTerm);
    }

    onAmountFilterChange(): void {
        this.amountFilterSubject.next();
    }

    applyFilters(): void {
        this.currentPage = 0;
        this.first = 0;
        this.loadExpenses();
    }

    onPeriodTypeChange(): void {
        // Réinitialiser les champs de date lors du changement de type
        this.selectedDate = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.dateRange = null;
        this.applyFilters();
    }

    resetAllFilters(): void {
        this.searchTerm = '';
        this.selectedCategory = null;
        this.selectedSupplier = null;
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
        this.first = 0;

        this.loadExpenses();
    }

    // ========== Chargement des données ==========

    private loadExpenses(): void {
        this.loading = true;
        const filter = this.buildFilter();

        this.expenseService.getExpenses(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.expenses = response.expenses;
                    this.totalRecords = response.total;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des dépenses', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les dépenses'
                    });
                }
            });
    }

    private buildFilter(): ExpenseListFilter {
        const filter: ExpenseListFilter = {
            page: this.currentPage,
            size: this.pageSize
        };

        if (this.searchTerm?.trim()) {
            filter.search = this.searchTerm.trim();
        }

        if (this.selectedCategory) {
            filter.categorieId = this.selectedCategory;
        }

        if (this.selectedSupplier) {
            filter.fournisseurId = this.selectedSupplier;
        }

        if (this.selectedStatus) {
            filter.statut = this.selectedStatus;
        }

        if (this.selectedPaymentMethod) {
            filter.paymentMethodId = this.selectedPaymentMethod;
        }

        if (this.minAmount) {
            filter.montantMin = this.minAmount;
        }

        if (this.maxAmount) {
            filter.montantMax = this.maxAmount;
        }

        // Gestion des filtres de date
        this.applyDateFilters(filter);

        return filter;
    }

    private applyDateFilters(filter: ExpenseListFilter): void {
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

    // ========== Gestion de la pagination ==========

    onLazyLoadChange(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.first = event.first;
        this.loadExpenses();
    }

    // ========== Actions sur les dépenses ==========

    editExpense(expense: Expense): void {
        this.onEdit.emit(expense);
    }

    deleteExpense(expense: Expense): void {
        this.onDelete.emit(expense);
    }

    changeStatus(expense: Expense, status: ExpenseStatus): void {
        this.onStatusChange.emit({ expense, status });
    }

    duplicateExpense(expense: Expense): void {
        const duplicatedExpense: Expense = {
            ...expense,
            id: 0,
            numero: '',
            statut: ExpenseStatus.EN_ATTENTE,
            dateDepense: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.onEdit.emit(duplicatedExpense);
    }

    // ========== Menu contextuel ==========

    getMenuItems(expense: Expense): MenuItem[] {
        const canEdit = this.canEditExpense(expense);
        const canApprove = this.canApproveExpense(expense);
        const canReject = this.canRejectExpense(expense);
        const canMarkPaid = this.canMarkAsPaid(expense);

        return [
            {
                label: 'Modifier',
                icon: 'pi pi-pencil',
                disabled: !canEdit,
                command: () => this.editExpense(expense)
            },
            {
                separator: true
            },
            {
                label: 'Approuver',
                icon: 'pi pi-check',
                disabled: !canApprove,
                command: () => this.changeStatus(expense, ExpenseStatus.APPROUVEE)
            },
            {
                label: 'Marquer comme payée',
                icon: 'pi pi-dollar',
                disabled: !canMarkPaid,
                command: () => this.changeStatus(expense, ExpenseStatus.PAYEE)
            },
            {
                label: 'Rejeter',
                icon: 'pi pi-times',
                disabled: !canReject,
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
                disabled: !canEdit,
                command: () => this.deleteExpense(expense)
            }
        ];
    }

    // ========== Gestion de la sélection ==========

    onExpenseSelectionChange(selectedExpenses: Expense[]): void {
        this.selectedExpenses = selectedExpenses;
        this.onSelectionChange.emit(selectedExpenses);
    }

    // ========== Actions en lot ==========

    approveSelectedExpenses(): void {
        if (this.selectedExpenses.length === 0) return;

        // Filtrer les dépenses qui peuvent être approuvées
        const approvableExpenses = this.selectedExpenses.filter(expense =>
            this.canApproveExpense(expense)
        );

        if (approvableExpenses.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune dépense sélectionnée ne peut être approuvée'
            });
            return;
        }

        // Émettre l'événement pour chaque dépense
        approvableExpenses.forEach(expense => {
            this.changeStatus(expense, ExpenseStatus.APPROUVEE);
        });

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `${approvableExpenses.length} dépense(s) approuvée(s)`
        });
    }

    rejectSelectedExpenses(): void {
        if (this.selectedExpenses.length === 0) return;

        // Filtrer les dépenses qui peuvent être rejetées
        const rejectableExpenses = this.selectedExpenses.filter(expense =>
            this.canRejectExpense(expense)
        );

        if (rejectableExpenses.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune dépense sélectionnée ne peut être rejetée'
            });
            return;
        }

        // Émettre l'événement pour chaque dépense
        rejectableExpenses.forEach(expense => {
            this.changeStatus(expense, ExpenseStatus.REJETEE);
        });

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `${rejectableExpenses.length} dépense(s) rejetée(s)`
        });
    }

    // ========== Méthodes utilitaires ==========

    getDisplayIndex(rowIndex: number): number {
        return this.first + rowIndex + 1;
    }

    getDisplayRange(): string {
        if (this.totalRecords === 0) return '0';
        const start = this.first + 1;
        const end = Math.min(this.first + this.pageSize, this.totalRecords);
        return `${start} à ${end}`;
    }

    formatCurrency(amount: number, currency: Currency = Currency.XOF): string {
        if (currency === Currency.XOF) {
            return new Intl.NumberFormat('fr-SN', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0
            }).format(amount);
        } else {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
            }).format(amount);
        }
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
        return severityMap[status] || 'secondary';
    }

    // ========== Méthodes de vérification des permissions (publiques pour le template) ==========

    canEditExpense(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.EN_ATTENTE || expense.statut === ExpenseStatus.REJETEE;
    }

    canApproveExpense(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.EN_ATTENTE;
    }

    canRejectExpense(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.EN_ATTENTE || expense.statut === ExpenseStatus.APPROUVEE;
    }

    canMarkAsPaid(expense: Expense): boolean {
        return expense.statut === ExpenseStatus.APPROUVEE;
    }

    // ========== Export ==========

    exportToPdf(): void {
        const filter = this.buildFilter();

        this.expenseService.exportToPdf(filter)
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

        this.expenseService.exportToExcel(filter)
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

    protected readonly Currency = Currency;

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }
}
