// src/app/pages/expenses/components/expense-form/expense-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { ExpenseService } from '../../../service/expense.service';
import { LoggerService } from '../../../../core/services/logger.service';

// Models
import {
    Expense,
    ExpenseStatus,
    PaymentMethod,
    Currency,
    CreateExpenseRequest,
    UpdateExpenseRequest,
    PAYMENT_METHOD_LABELS,
    CURRENCY_LABELS
} from '../../../../shared/models/expense.model';
import { MOCK_EXPENSE_CATEGORIES, MOCK_EXPENSE_SUPPLIERS, EXPENSE_CONFIG } from '../../../../shared/data/expense.data';
import { Textarea } from 'primeng/textarea';

@Component({
    selector: 'app-expense-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        InputNumberModule,
        CheckboxModule,
        FileUploadModule,
        TooltipModule,
        Textarea
    ],
    template: `
        <div class="expense-form">
            <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">

                <!-- En-tête du formulaire -->
                <div class="form-header mb-6">
                    <h2 class="text-2xl font-semibold text-900 mb-2">
                        {{ editMode ? 'Modifier la dépense' : 'Ajouter une dépense' }}
                    </h2>
                </div>

                <!-- Informations générales -->
                <div class="form-section mb-6">
                    <div class="section-header mb-4">
                        <i class="pi pi-info-circle text-primary mr-2"></i>
                        <h3 class="text-lg font-medium text-primary m-0">Informations générales</h3>
                    </div>

                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label class="field-label">N° Dépense <span class="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    pInputText
                                    formControlName="numero"
                                    placeholder="Numéro automatique"
                                    [readonly]="true"
                                    class="field-input"
                                />
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label class="field-label">Date de dépense <span class="text-red-500">*</span></label>
                                <p-calendar
                                    formControlName="dateDepense"
                                    dateFormat="dd/mm/yy"
                                    [showIcon]="true"
                                    placeholder="Sélectionner la date"
                                    class="field-input">
                                </p-calendar>
                            </div>
                        </div>

                        <div class="col-12 md:col-4">
                            <div class="field">
                                <label class="field-label">Catégorie <span class="text-red-500">*</span></label>
                                <p-dropdown
                                    formControlName="categorieId"
                                    [options]="categoryOptions"
                                    placeholder="Sélectionner une catégorie"
                                    optionLabel="label"
                                    optionValue="value"
                                    [filter]="true"
                                    filterBy="label"
                                    (onChange)="onCategoryChange($event)"
                                    class="field-input">
                                </p-dropdown>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label class="field-label">Titre <span class="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    pInputText
                                    formControlName="titre"
                                    placeholder="Ex: Achat carburant gazole"
                                    class="field-input"
                                />
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label class="field-label">Description <span class="text-red-500">*</span></label>
                                <textarea
                                    pInputTextarea
                                    formControlName="description"
                                    placeholder="Description détaillée de la dépense..."
                                    rows="3"
                                    class="field-textarea">
                                </textarea>
                                <small class="field-message text-red-500" *ngIf="expenseForm.get('description')?.invalid && expenseForm.get('description')?.touched">
                                    La description est obligatoire
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fournisseur -->
                <div class="form-section mb-6">
                    <div class="section-header mb-4">
                        <i class="pi pi-users text-primary mr-2"></i>
                        <h3 class="text-lg font-medium text-primary m-0">Fournisseur</h3>
                    </div>

                    <div class="grid">
                        <div class="col-12">
                            <div class="field">
                                <label class="field-label">Fournisseur</label>
                                <p-dropdown
                                    formControlName="fournisseurId"
                                    [options]="supplierOptions"
                                    placeholder="Sélectionner un fournisseur (optionnel)"
                                    optionLabel="label"
                                    optionValue="value"
                                    [filter]="true"
                                    filterBy="label"
                                    [showClear]="true"
                                    (onChange)="onSupplierChange($event)"
                                    class="field-input">
                                </p-dropdown>

                                <div *ngIf="selectedSupplier" class="supplier-info">
                                    <div class="text-sm text-600">
                                        <div class="font-medium text-900">{{ selectedSupplier.nom }}</div>
                                        <div *ngIf="selectedSupplier.raisonSociale">{{ selectedSupplier.raisonSociale }}</div>
                                        <div *ngIf="selectedSupplier.adresse">{{ selectedSupplier.adresse }}</div>
                                        <div *ngIf="selectedSupplier.telephone">Tél: {{ selectedSupplier.telephone }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Montant et paiement -->
                <div class="form-section mb-6">
                    <div class="section-header mb-4">
                        <i class="pi pi-dollar text-primary mr-2"></i>
                        <h3 class="text-lg font-medium text-primary m-0">Montant et paiement</h3>
                    </div>

                    <div class="grid">
                        <div class="col-12 md:col-2">
                            <div class="field">
                                <label class="field-label">Mode de paiement <span class="text-red-500">*</span></label>
                                <p-dropdown
                                    formControlName="modePaiement"
                                    [options]="paymentMethodOptions"
                                    placeholder="Sélectionner le mode"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="field-input">
                                </p-dropdown>
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label class="field-label">Montant en XOF <span class="text-red-500">*</span></label>
                                <p-inputNumber
                                    formControlName="montantXOF"
                                    suffix=" F CFA"
                                    [min]="0"
                                    (onInput)="onAmountChange()"
                                    class="field-input">
                                </p-inputNumber>
                            </div>
                        </div>

                        <div class="col-12 md:col-3">
                            <div class="field">
                                <label class="field-label">Montant en EUR</label>
                                <p-inputNumber
                                    formControlName="montantEURO"
                                    suffix=" €"
                                    [min]="0"
                                    (onInput)="onEuroAmountChange()"
                                    class="field-input">
                                </p-inputNumber>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label class="field-label">Mode de paiement <span class="text-red-500">*</span></label>
                                <p-dropdown
                                    formControlName="modePaiement"
                                    [options]="paymentMethodOptions"
                                    placeholder="Sélectionner le mode"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="field-input">
                                </p-dropdown>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <div class="form-section mb-6">
                    <div class="section-header mb-4">
                        <i class="pi pi-file-edit text-primary mr-2"></i>
                        <h3 class="text-lg font-medium text-primary m-0">Notes</h3>
                    </div>

                    <div class="grid">
                        <div class="col-12">
                            <div class="field">
                                <label class="field-label">Notes</label>
                                <textarea
                                    pInputTextarea
                                    formControlName="notes"
                                    placeholder="Notes ou commentaires supplémentaires..."
                                    rows="3"
                                    class="field-textarea">
                                </textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
               

                <div class="form-actions">
                    <button
                        type="button"
                        pButton
                        label="Annuler"
                        icon="pi pi-times"
                        class="p-button-text"
                        (click)="onCancelView()"
                    ></button>
                    <button
                        type="submit"
                        pButton
                        [label]="editMode ? 'Modifier' : 'Créer'"
                        [icon]="editMode ? 'pi pi-check' : 'pi pi-plus'"
                        [loading]="saving"
                        [disabled]="expenseForm.invalid"
                        class="ml-2"
                        style="background-color: var(--svs-primary); border-color: var(--svs-primary)"
                    ></button>
                </div>

            </form>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }

        .expense-form {
            max-width: 1000px;
            margin: 0 auto;
            padding: 1rem;
        }

        .form-header {
            text-align: left;
        }

        .form-section {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }

        .section-header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
        }

        .field {
            margin-bottom: 1.5rem;
        }

        .field-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .field-input {
            width: 100%;
        }

        .field-textarea {
            width: 100%;
            resize: vertical;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 0.75rem;
            font-size: 0.875rem;
            transition: border-color 0.15s ease-in-out;
        }

        .field-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .field-textarea::placeholder {
            color: #9ca3af;
        }

        .field-message {
            display: block;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }

        .supplier-info {
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        .create-button {
            background: #3b82f6;
            border: none;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
        }

        /* Styles pour les composants PrimeNG */
        ::ng-deep .p-inputtext,
        ::ng-deep .p-dropdown,
        ::ng-deep .p-calendar,
        ::ng-deep .p-inputnumber {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        ::ng-deep .p-inputtext:focus,
        ::ng-deep .p-dropdown:focus,
        ::ng-deep .p-calendar:focus,
        ::ng-deep .p-inputnumber:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        ::ng-deep .p-fileupload {
            border: 2px dashed #d1d5db;
            border-radius: 6px;
            background: #f9fafb;
        }

        ::ng-deep .p-fileupload .p-fileupload-buttonbar {
            background: transparent;
            border: none;
            padding: 1rem;
        }

        ::ng-deep .p-button {
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.15s ease-in-out;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .expense-form {
                padding: 0.5rem;
            }

            .form-section {
                padding: 1rem;
            }

            .form-actions {
                flex-direction: column;
                gap: 0.5rem;
            }

            .form-actions .p-button {
                width: 100%;
                justify-content: center;
            }
        }
    `]
})
export class ExpenseFormComponent implements OnInit, OnChanges {
    @Input() expense: Expense | null = null;
    @Input() editMode = false;

    @Output() onSave = new EventEmitter<CreateExpenseRequest | UpdateExpenseRequest>();
    @Output() onCancel = new EventEmitter<void>();

    expenseForm!: FormGroup;
    saving = false;

    // Options pour les dropdowns
    categoryOptions: { label: string; value: number }[] = [];
    supplierOptions: { label: string; value: number }[] = [];
    paymentMethodOptions: { label: string; value: PaymentMethod }[] = [];
    currencyOptions: { label: string; value: Currency }[] = [];

    // Objets sélectionnés
    selectedCategory: any = null;
    selectedSupplier: any = null;

    // États du formulaire
    showEuroFields = false;
    selectedFiles: File[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly expenseService: ExpenseService,
        private readonly logger: LoggerService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.initializeOptions();
        this.generateExpenseNumber();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['expense'] && this.expense) {
            this.populateForm();
        }
    }

    private initializeForm(): void {
        this.expenseForm = this.fb.group({
            numero: ['', Validators.required],
            titre: ['', Validators.required],
            description: ['', Validators.required],
            categorieId: [null, Validators.required],
            fournisseurId: [null],
            dateDepense: [new Date(), Validators.required],
            montantXOF: [null, [Validators.required, Validators.min(0.01)]],
            montantEURO: [null],
            modePaiement: [PaymentMethod.VIREMENT, Validators.required],
            notes: ['']
        });
    }

    private initializeOptions(): void {
        // Options des catégories
        this.categoryOptions = MOCK_EXPENSE_CATEGORIES.map(category => ({
            label: category.nom,
            value: category.id
        }));

        // Options des fournisseurs
        this.supplierOptions = [
            { label: 'Aucun fournisseur', value: 0 },
            ...MOCK_EXPENSE_SUPPLIERS.map(supplier => ({
                label: supplier.nom,
                value: supplier.id
            }))
        ];

        // Options des modes de paiement
        this.paymentMethodOptions = Object.values(PaymentMethod).map(method => ({
            label: PAYMENT_METHOD_LABELS[method],
            value: method
        }));
    }

    private generateExpenseNumber(): void {
        if (!this.editMode) {
            const numero = this.expenseService.generateExpenseNumber();
            this.expenseForm.patchValue({ numero });
        }
    }

    private populateForm(): void {
        if (!this.expense) return;

        this.expenseForm.patchValue({
            numero: this.expense.numero,
            titre: this.expense.titre,
            description: this.expense.description,
            categorieId: this.expense.categorieId,
            fournisseurId: this.expense.fournisseurId,
            dateDepense: new Date(this.expense.dateDepense),
            montantXOF: this.expense.montantXOF,
            montantEURO: this.expense.montantEURO,
            tauxChange: this.expense.tauxChange,
            devise: this.expense.devise
        });

        // Sélectionner les objets
        this.selectedCategory = this.expense.categorie;
        this.selectedSupplier = this.expense.fournisseur;

        // Afficher les champs EUR si nécessaire
        this.showEuroFields = this.expense.devise === Currency.EUR;
    }

    // Gestion des événements de sélection
    onCategoryChange(event: any): void {
        const categoryId = event.value;
        this.selectedCategory = MOCK_EXPENSE_CATEGORIES.find(c => c.id === categoryId);
        this.logger.debug('Catégorie sélectionnée', this.selectedCategory);
    }

    onSupplierChange(event: any): void {
        const supplierId = event.value;
        this.selectedSupplier = supplierId ?
            MOCK_EXPENSE_SUPPLIERS.find(s => s.id === supplierId) : null;
        this.logger.debug('Fournisseur sélectionné', this.selectedSupplier);
    }

    onCurrencyChange(event: any): void {
        const currency = event.value;
        this.showEuroFields = currency === Currency.EUR;

        if (!this.showEuroFields) {
            this.expenseForm.patchValue({
                montantEURO: null,
                tauxChange: null
            });
        }
    }

    // Gestion des calculs de montant
    onAmountChange(): void {
        this.updateEuroAmount();
    }

    onEuroAmountChange(): void {
        const euroAmount = this.expenseForm.get('montantEURO')?.value;
        const exchangeRate = this.expenseForm.get('tauxChange')?.value;

        if (euroAmount && exchangeRate) {
            const xofAmount = euroAmount * exchangeRate;
            this.expenseForm.patchValue({ montantXOF: xofAmount }, { emitEvent: false });
        }
    }

    onExchangeRateChange(): void {
        this.updateEuroAmount();
    }

    private updateEuroAmount(): void {
        if (!this.showEuroFields) return;

        const xofAmount = this.expenseForm.get('montantXOF')?.value;
        const exchangeRate = this.expenseForm.get('tauxChange')?.value;

        if (xofAmount && exchangeRate) {
            const euroAmount = xofAmount / exchangeRate;
            this.expenseForm.patchValue({ montantEURO: euroAmount }, { emitEvent: false });
        }
    }

    // Gestion des fichiers
    onFilesSelected(event: any): void {
        this.selectedFiles = event.files;
        this.logger.debug('Fichiers sélectionnés', { count: this.selectedFiles.length });
    }

    // Soumission du formulaire
    onSubmit(): void {
        if (this.expenseForm.invalid) {
            this.markFormGroupTouched(this.expenseForm);
            return;
        }

        this.saving = true;
        const formValue = this.expenseForm.value;

        if (this.editMode && this.expense) {
            const updateRequest: UpdateExpenseRequest = {
                id: this.expense.id,
                titre: formValue.titre,
                description: formValue.description,
                categorieId: formValue.categorieId,
                fournisseurId: formValue.fournisseurId,
                dateDepense: formValue.dateDepense,
                montantXOF: formValue.montantXOF,
                montantEURO: formValue.montantEURO,
                modePaiement: formValue.modePaiement
            };
            this.onSave.emit(updateRequest);
        } else {
            const createRequest: CreateExpenseRequest = {
                titre: formValue.titre,
                description: formValue.description,
                categorieId: formValue.categorieId,
                fournisseurId: formValue.fournisseurId,
                dateDepense: formValue.dateDepense,
                montantXOF: formValue.montantXOF,
                montantEURO: formValue.montantEURO,
                modePaiement: formValue.modePaiement
            };
            this.onSave.emit(createRequest);
        }

        this.saving = false;
    }

    onCancelView(): void {
        this.onCancel.emit();
    }

    // Méthodes utilitaires
    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }
}
