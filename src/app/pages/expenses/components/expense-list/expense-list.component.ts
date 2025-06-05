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
    template: `
        <div class="expense-list">
            <!-- Barre de recherche et filtres -->
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4">
                <div class="flex flex-column md:flex-row gap-3 flex-1">
                    <!-- Recherche -->
                    <div class="relative">
                        <i class="pi pi-search absolute text-color-secondary" style="top: 50%; margin-top: -0.5rem; left: 0.75rem;"></i>
                        <input
                            type="text"
                            pInputText
                            [(ngModel)]="searchTerm"
                            placeholder="Rechercher par titre, numéro ou fournisseur..."
                            (input)="onSearchInputChange()"
                            class="pl-6 w-full md:w-20rem"
                        />
                    </div>

                    <!-- Filtres -->
                    <div class="flex flex-wrap gap-2">
                        <p-dropdown
                            [(ngModel)]="selectedCategory"
                            [options]="categoryOptions"
                            placeholder="Toutes les catégories"
                            optionLabel="label"
                            optionValue="value"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            class="w-12rem">
                        </p-dropdown>

                        <p-dropdown
                            [(ngModel)]="selectedStatus"
                            [options]="statusOptions"
                            placeholder="Tous les statuts"
                            optionLabel="label"
                            optionValue="value"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            class="w-10rem">
                        </p-dropdown>

                        <p-dropdown
                            [(ngModel)]="selectedPaymentMethod"
                            [options]="paymentMethodOptions"
                            placeholder="Mode de paiement"
                            optionLabel="label"
                            optionValue="value"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            class="w-10rem">
                        </p-dropdown>

                        <!-- Filtre par période -->
                        <p-dropdown
                            [(ngModel)]="selectedPeriodType"
                            [options]="periodTypeOptions"
                            placeholder="Filtrer par"
                            optionLabel="label"
                            optionValue="value"
                            (onChange)="onPeriodTypeChange()"
                            class="w-8rem">
                        </p-dropdown>

                        <!-- Date spécifique -->
                        <p-calendar
                            *ngIf="selectedPeriodType === 'day'"
                            [(ngModel)]="selectedDate"
                            dateFormat="dd/mm/yy"
                            placeholder="Jour"
                            [showIcon]="true"
                            (onSelect)="applyFilters()"
                            (onClearClick)="applyFilters()"
                            class="w-10rem">
                        </p-calendar>

                        <!-- Mois et année -->
                        <div *ngIf="selectedPeriodType === 'month'" class="flex gap-1">
                            <p-dropdown
                                [(ngModel)]="selectedMonth"
                                [options]="monthOptions"
                                placeholder="Mois"
                                optionLabel="label"
                                optionValue="value"
                                [showClear]="true"
                                (onChange)="applyFilters()"
                                class="w-7rem">
                            </p-dropdown>
                            <p-dropdown
                                [(ngModel)]="selectedYear"
                                [options]="yearOptions"
                                placeholder="Année"
                                optionLabel="label"
                                optionValue="value"
                                [showClear]="true"
                                (onChange)="applyFilters()"
                                class="w-6rem">
                            </p-dropdown>
                        </div>

                        <!-- Année -->
                        <p-dropdown
                            *ngIf="selectedPeriodType === 'year'"
                            [(ngModel)]="selectedYear"
                            [options]="yearOptions"
                            placeholder="Année"
                            optionLabel="label"
                            optionValue="value"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            class="w-6rem">
                        </p-dropdown>

                        <!-- Période personnalisée -->
                        <p-calendar
                            *ngIf="selectedPeriodType === 'range'"
                            [(ngModel)]="dateRange"
                            selectionMode="range"
                            [readonlyInput]="true"
                            placeholder="Période"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            (onSelect)="applyFilters()"
                            (onClearClick)="applyFilters()"
                            class="w-14rem">
                        </p-calendar>

                        <!-- Bouton reset -->
                        <p-button
                            icon="pi pi-filter-slash"
                            label="Réinitialiser"
                            severity="secondary"
                            [outlined]="true"
                            size="small"
                            (onClick)="resetAllFilters()"
                            pTooltip="Réinitialiser tous les filtres">
                        </p-button>
                    </div>
                </div>
            </div>

            <!-- Filtres par montant -->
            <div class="flex flex-wrap gap-3 mb-4">
                <div class="flex align-items-center gap-2">
                    <label class="text-sm font-medium">Montant entre:</label>
                    <p-inputNumber
                        [(ngModel)]="minAmount"
                        mode="currency"
                        currency="XOF"
                        locale="fr-SN"
                        placeholder="Min"
                        (onInput)="onAmountFilterChange()"
                        class="w-8rem">
                    </p-inputNumber>
                    <span class="text-sm">et</span>
                    <p-inputNumber
                        [(ngModel)]="maxAmount"
                        mode="currency"
                        currency="XOF"
                        locale="fr-SN"
                        placeholder="Max"
                        (onInput)="onAmountFilterChange()"
                        class="w-8rem">
                    </p-inputNumber>
                </div>
            </div>

            <!-- Tableau des dépenses -->
            <p-table
                #dt
                [value]="expenses"
                [loading]="loading"
                [lazy]="true"
                [paginator]="true"
                [rows]="pageSize"
                [totalRecords]="totalRecords"
                [rowsPerPageOptions]="[10, 25, 50]"
                [sortField]="'dateDepense'"
                [sortOrder]="-1"
                responsiveLayout="scroll"
                (onLazyLoad)="onLazyLoadChange($event)"
                styleClass="p-datatable-sm">

                <!-- En-tête du tableau -->
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 3rem">#</th>
                        <th pSortableColumn="numero" style="min-width: 10rem">
                            Numéro
                            <p-sortIcon field="numero"></p-sortIcon>
                        </th>
                        <th style="min-width: 12rem">Titre</th>
                        <th style="min-width: 8rem">Catégorie</th>
                        <th style="min-width: 10rem">Fournisseur</th>
                        <th pSortableColumn="dateDepense" style="min-width: 8rem">
                            Date
                            <p-sortIcon field="dateDepense"></p-sortIcon>
                        </th>
                        <th pSortableColumn="montantXOF" style="min-width: 10rem">
                            Montant
                            <p-sortIcon field="montantXOF"></p-sortIcon>
                        </th>
                        <th style="min-width: 8rem">Mode paiement</th>
                        <th pSortableColumn="statut" style="min-width: 8rem">
                            Statut
                            <p-sortIcon field="statut"></p-sortIcon>
                        </th>
                        <th style="width: 8rem">Actions</th>
                    </tr>
                </ng-template>

                <!-- Corps du tableau -->
                <ng-template pTemplate="body" let-expense let-rowIndex="rowIndex">
                    <tr>
                        <td>{{ getDisplayIndex(rowIndex) }}</td>

                        <td>
                            <div class="font-medium text-primary">{{ expense.numero }}</div>
                            <div class="text-sm text-color-secondary">{{ expense.dateDepense | date:'dd/MM/yyyy' }}</div>
                        </td>

                        <td>
                            <div class="font-medium">{{ expense.titre }}</div>
                            <div class="text-sm text-color-secondary">{{ expense.description | slice:0:50 }}{{ expense.description.length > 50 ? '...' : '' }}</div>
                        </td>

                        <td>
                            <div class="flex align-items-center gap-2">
                                <i [class]="'pi ' + expense.categorie?.icone" [style.color]="expense.categorie?.couleur"></i>
                                <span class="font-medium">{{ expense.categorie?.nom }}</span>
                            </div>
                        </td>

                        <td>
                            <div *ngIf="expense.fournisseur" class="font-medium">{{ expense.fournisseur.nom }}</div>
                            <div *ngIf="!expense.fournisseur" class="text-color-secondary">Non spécifié</div>
                        </td>

                        <td>{{ expense.dateDepense | date:'dd/MM/yyyy' }}</td>

                        <td>
                            <div class="font-bold">{{ formatCurrency(expense.montantXOF) }}</div>
                            <div *ngIf="expense.montantEURO" class="text-sm text-color-secondary">
                                {{ expense.montantEURO | currency:'EUR':'symbol':'1.2-2':'fr-FR' }}
                            </div>
                        </td>

                        <td>
                            <div class="text-sm">{{ getPaymentMethodLabel(expense.modePaiement) }}</div>
                            <div *ngIf="expense.numeroFacture" class="text-xs text-color-secondary">
                                Fact: {{ expense.numeroFacture }}
                            </div>
                        </td>

                        <td>
                            <p-tag
                                [value]="getStatusLabel(expense.statut)"
                                [severity]="getStatusSeverity(expense.statut)">
                            </p-tag>
                        </td>

                        <td>
                            <div class="flex gap-1">
                                <p-button
                                    icon="pi pi-pencil"
                                    severity="warn"
                                    [text]="true"
                                    size="small"
                                    (onClick)="editExpense(expense)"
                                    pTooltip="Modifier">
                                </p-button>

                                <p-button
                                    #menuButton
                                    icon="pi pi-ellipsis-v"
                                    severity="secondary"
                                    [text]="true"
                                    size="small"
                                    (onClick)="showMenu($event, expense, menu)"
                                    pTooltip="Plus d'actions">
                                </p-button>

                                <p-menu #menu [popup]="true" [model]="getMenuItems(expense)"></p-menu>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <!-- Loading -->
                <ng-template pTemplate="loading">
                    <div class="flex align-items-center justify-content-center h-10rem">
                        <p-progressSpinner></p-progressSpinner>
                    </div>
                </ng-template>

                <!-- Message si aucun résultat -->
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="10" class="text-center p-4">
                            <div class="flex flex-column align-items-center">
                                <i class="pi pi-inbox text-4xl text-color-secondary mb-3"></i>
                                <span class="text-lg">Aucune dépense trouvée</span>
                                <span class="text-color-secondary">Ajustez vos filtres ou créez une nouvelle dépense</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Pagination en bas -->
            <div class="flex justify-content-between align-items-center mt-3">
                <div class="text-sm text-color-secondary">
                    Affichage de {{ getDisplayRange() }} sur {{ totalRecords }} dépenses
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }

        .expense-list {
            padding: 0;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.75rem;
            vertical-align: top;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            padding: 1rem 0.75rem;
            background: var(--surface-50);
            border-color: var(--surface-200);
            font-weight: 600;
        }

        ::ng-deep .p-tag {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
        }

        .currency {
            font-family: 'Courier New', monospace;
            font-weight: 600;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
            background: var(--surface-50);
        }
    `]
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
