// src/app/pages/expenses/components/expense-form/expense-form.component.ts

import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services
import { ExpenseService } from '../../../service/expense.service';
import { ExpenseCategoryService } from '../../../expense-category/service/expense-category.service';
import { ExpenseSupplierService } from '../../../expense-supplier/service/expense-supplier.service';
import { PaymentMethodService } from '../../../payment-methods/service/payment-method.service';
import { LoggerService } from '../../../../core/services/logger.service';

// Models
import {
    Currency,
    CURRENCY_LABELS,
    DropdownOption,
    Expense,
    ExpenseCreateRequest,
    ExpenseStatus,
    ExpenseSupplier,
    ExpenseUpdateRequest
} from '../../../../shared/models/expense.model';
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
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() expense: Expense | null = null;
    @Input() editMode = false;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<ExpenseCreateRequest | ExpenseUpdateRequest>();
    @Output() onCancel = new EventEmitter<void>();

    // Services injectés
    private readonly fb = inject(FormBuilder);
    private readonly expenseService = inject(ExpenseService);
    private readonly expenseCategoryService = inject(ExpenseCategoryService);
    private readonly expenseSupplierService = inject(ExpenseSupplierService);
    private readonly paymentMethodService = inject(PaymentMethodService);
    private readonly messageService = inject(MessageService);
    private readonly logger = inject(LoggerService);

    // Formulaire
    expenseForm!: FormGroup;
    saving = false;
    loadingOptions = false;

    // Options pour les dropdowns
    categoryOptions: DropdownOption[] = [];
    supplierOptions: DropdownOption[] = [];
    paymentMethodOptions: DropdownOption[] = [];
    currencyOptions: DropdownOption[] = [];

    // Objets sélectionnés pour affichage des détails
    selectedCategory: any = null;
    selectedSupplier: ExpenseSupplier | null = null;
    selectedPaymentMethod: DropdownOption | null = null;

    // États du formulaire
    showEuroFields = false;
    autoGenerateNumber = true;
    exchangeRateSubject = new Subject<void>();

    // Constantes
    readonly DEFAULT_EXCHANGE_RATE = 656; // 1 EUR = 656 XOF (approximatif)
    readonly MIN_AMOUNT = 0.01;
    readonly MAX_DESCRIPTION_LENGTH = 1000;

    // Subject pour la gestion de la destruction du composant
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initializeForm();
        this.initializeOptions();
        this.setupExchangeRateCalculation();
        this.logger.info('ExpenseFormComponent initialisé', { editMode: this.editMode });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['expense'] && this.expense && this.expenseForm) {
            this.populateForm();
        }
        if (changes['visible'] && this.visible && !this.editMode) {
            this.generateExpenseNumber();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ========== Initialisation ==========

    private initializeForm(): void {
        this.generateExpenseNumber()
        this.expenseForm = this.fb.group({
            numero: ['', [Validators.required, Validators.maxLength(20)]],
            titre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
            description: ['', [Validators.maxLength(this.MAX_DESCRIPTION_LENGTH)]],
            categorieId: [null, Validators.required],
            fournisseurId: [null],
            dateDepense: [new Date(), Validators.required],
            montantXOF: [null, [Validators.required, Validators.min(this.MIN_AMOUNT)]],
            montantEURO: [null, Validators.min(this.MIN_AMOUNT)],
            tauxChange: [this.DEFAULT_EXCHANGE_RATE, Validators.min(0.01)],
            devise: [Currency.XOF, Validators.required],
            paymentMethodId: [null, Validators.required],
            statut: [ExpenseStatus.EN_ATTENTE]
        });

        // Surveillance des changements de devise
        this.expenseForm.get('devise')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(devise => {
                this.onCurrencyChange(devise);
            });
    }

    private initializeOptions(): void {
        this.loadingOptions = true;

        // Options des devises
        this.currencyOptions = Object.values(Currency).map(currency => ({
            label: CURRENCY_LABELS[currency],
            value: currency
        }));

        // Chargement des catégories
        this.expenseCategoryService.getCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.categoryOptions = response.data.categories.map(category => ({
                        label: category.nom,
                        value: category.id
                    }));
                    this.logger.debug('Catégories chargées', { count: response.data.total });
                },
                error: (error) => {
                    this.logger.error('Erreur chargement catégories', error);
                }
            });

        // Chargement des fournisseurs
        this.expenseSupplierService.getSuppliers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.supplierOptions = [
                        { label: 'Aucun fournisseur spécifique', value: null },
                        ...response.data.suppliers.map(supplier => ({
                            label: supplier.nom,
                            value: supplier.id
                        }))
                    ];
                    this.logger.debug('Fournisseurs chargés', { count: response.data.total });
                },
                error: (error) => {
                    this.logger.error('Erreur chargement fournisseurs', error);
                }
            });

        // Chargement des modes de paiement
        this.paymentMethodService.getPaymentMethods()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.paymentMethodOptions = response.data.paymentMethods.map(method => ({
                        label: method.nom,
                        value: method.id
                    }));
                    this.logger.debug('Modes de paiement chargés', { count: response.data.totalElements });
                },
                error: (error) => {
                    this.logger.error('Erreur chargement modes de paiement', error);
                }
            });

        this.loadingOptions = false;
    }

    private setupExchangeRateCalculation(): void {
        // Calcul automatique avec debounce pour éviter les calculs trop fréquents
        this.exchangeRateSubject.pipe(
            debounceTime(300),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.calculateAmounts();
        });
    }

    private generateExpenseNumber(): void {
        if (!this.editMode && this.autoGenerateNumber) {
            this.expenseService.generateNumero()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (numero) => {
                        this.expenseForm.patchValue({ numero });
                        this.logger.debug('Numéro généré', numero);
                    },
                    error: (error) => {
                        this.logger.error('Erreur génération numéro', error);
                        // Fallback vers génération locale
                        const fallbackNumero = this.generateFallbackNumber();
                        this.expenseForm.patchValue({ numero: fallbackNumero });
                    }
                });
        }
    }

    private generateFallbackNumber(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.getTime().toString().slice(-4);
        return `DEP-${dateStr}-${timeStr}`;
    }

    private populateForm(): void {
        if (!this.expense) return;

        this.autoGenerateNumber = false;

        this.expenseForm.patchValue({
            numero: this.expense.numero,
            titre: this.expense.titre,
            description: this.expense.description,
            categorieId: this.expense.categorieId,
            fournisseurId: this.expense.fournisseurId,
            dateDepense: new Date(this.expense.dateDepense),
            montantXOF: this.expense.montantXOF,
            montantEURO: this.expense.montantEURO,
            tauxChange: this.expense.tauxChange || this.DEFAULT_EXCHANGE_RATE,
            devise: this.expense.devise,
            paymentMethodId: this.expense.paymentMethodId,
            statut: this.expense.statut
        });

        // Mettre à jour les affichages
        this.updateSelectedObjects();
        this.showEuroFields = this.expense.devise === Currency.EUR || !!this.expense.montantEURO;

        this.logger.debug('Formulaire populé', { expenseId: this.expense.id });
    }

    // ========== Gestion des événements ==========

    onCategoryChange(event: any): void {
        const categoryId = event.value;
        this.selectedCategory = this.categoryOptions.find(c => c.value === categoryId);
        this.logger.debug('Catégorie sélectionnée', { categoryId });
    }

    onSupplierChange(event: any): void {
        const supplierId = event.value;
        if (supplierId) {
            this.expenseSupplierService.getSupplierById(supplierId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (supplier) => {
                        this.selectedSupplier = supplier;
                        this.logger.debug('Fournisseur sélectionné', { supplierId });
                    },
                    error: (error) => {
                        this.logger.error('Erreur chargement fournisseur', error);
                        this.selectedSupplier = null;
                    }
                });
        } else {
            this.selectedSupplier = null;
        }
    }

    onPaymentMethodChange(event: any): void {
        const paymentMethodId = event.value;
        this.selectedPaymentMethod = this.paymentMethodOptions.find(p => p.value === paymentMethodId) || null;
        this.logger.debug('Mode de paiement sélectionné', { paymentMethodId });
    }

    onCurrencyChange(devise: Currency): void {
        this.showEuroFields = devise === Currency.EUR;

        if (devise === Currency.XOF) {
            // Si on passe en XOF, on garde les montants EUR comme informatifs
            this.expenseForm.get('montantEURO')?.setValidators([Validators.min(this.MIN_AMOUNT)]);
        } else {
            // Si on passe en EUR, montant EUR devient obligatoire
            this.expenseForm.get('montantEURO')?.setValidators([Validators.required, Validators.min(this.MIN_AMOUNT)]);
        }

        this.expenseForm.get('montantEURO')?.updateValueAndValidity();
        this.calculateAmounts();

        this.logger.debug('Devise changée', { devise, showEuroFields: this.showEuroFields });
    }

    onAmountChange(): void {
        this.exchangeRateSubject.next();
    }

    onEuroAmountChange(): void {
        this.exchangeRateSubject.next();
    }

    onExchangeRateChange(): void {
        this.exchangeRateSubject.next();
    }

    onNumeroBlur(): void {
        const numero = this.expenseForm.get('numero')?.value;
        if (numero && !this.editMode) {
            this.checkNumeroUniqueness(numero);
        }
    }

    // ========== Calculs et validations ==========

    private calculateAmounts(): void {
        const devise = this.expenseForm.get('devise')?.value;
        const montantXOF = this.expenseForm.get('montantXOF')?.value;
        const montantEUR = this.expenseForm.get('montantEURO')?.value;
        const tauxChange = this.expenseForm.get('tauxChange')?.value || this.DEFAULT_EXCHANGE_RATE;

        if (devise === Currency.XOF && montantXOF && tauxChange) {
            // Calculer le montant EUR à partir du montant XOF
            const calculatedEUR = montantXOF / tauxChange;
            this.expenseForm.patchValue({
                montantEURO: Math.round(calculatedEUR * 100) / 100
            }, { emitEvent: false });
        } else if (devise === Currency.EUR && montantEUR && tauxChange) {
            // Calculer le montant XOF à partir du montant EUR
            const calculatedXOF = montantEUR * tauxChange;
            this.expenseForm.patchValue({
                montantXOF: Math.round(calculatedXOF)
            }, { emitEvent: false });
        }
    }

    private checkNumeroUniqueness(numero: string): void {
        this.expenseService.checkNumeroExists(numero, this.expense?.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (exists) => {
                    if (exists) {
                        this.expenseForm.get('numero')?.setErrors({ notUnique: true });
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Attention',
                            detail: 'Ce numéro de dépense existe déjà'
                        });
                    }
                },
                error: (error) => {
                    this.logger.error('Erreur vérification unicité', error);
                }
            });
    }

    private updateSelectedObjects(): void {
        const categorieId = this.expenseForm.get('categorieId')?.value;
        const fournisseurId = this.expenseForm.get('fournisseurId')?.value;
        const paymentMethodId = this.expenseForm.get('paymentMethodId')?.value;

        if (categorieId) {
            this.selectedCategory = this.categoryOptions.find(c => c.value === categorieId);
        }

        if (fournisseurId) {
            this.onSupplierChange({ value: fournisseurId });
        }

        if (paymentMethodId) {
            this.selectedPaymentMethod = this.paymentMethodOptions.find(p => p.value === paymentMethodId) || null;
        }
    }

    // ========== Soumission du formulaire ==========

    onSubmit(): void {
        if (this.expenseForm.invalid) {
            this.markFormGroupTouched(this.expenseForm);
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulaire invalide',
                detail: 'Veuillez corriger les erreurs avant de continuer'
            });
            return;
        }

        this.saving = true;
        const formValue = this.expenseForm.value;

        // Préparation des données selon le mode
        if (this.editMode && this.expense) {
            const updateRequest: ExpenseUpdateRequest = {
                numero: formValue.numero,
                titre: formValue.titre,
                description: formValue.description,
                categorieId: formValue.categorieId,
                fournisseurId: formValue.fournisseurId || undefined,
                dateDepense: new Date(formValue.dateDepense).toISOString().split('T')[0],
                montantXOF: formValue.montantXOF,
                montantEURO: formValue.montantEURO || undefined,
                tauxChange: formValue.tauxChange || undefined,
                devise: formValue.devise,
                paymentMethodId: formValue.paymentMethodId
            };

            this.logger.info('Soumission mise à jour dépense', { id: this.expense.id });
            this.onSave.emit(updateRequest);
        } else {
            const createRequest: ExpenseCreateRequest = {
                // numero: formValue.numero,
                titre: formValue.titre,
                description: formValue.description,
                categorieId: formValue.categorieId,
                fournisseurId: formValue.fournisseurId || undefined,
                dateDepense: new Date(formValue.dateDepense).toISOString().split('T')[0],
                montantXOF: formValue.montantXOF,
                montantEURO: formValue.montantEURO || undefined,
                tauxChange: formValue.tauxChange || undefined,
                devise: formValue.devise,
                paymentMethodId: formValue.paymentMethodId,
                statut: formValue.statut
            };

            this.logger.info('Soumission création dépense');
            this.onSave.emit(createRequest);
        }

        this.saving = false;
    }

    onCancelClick(): void {
        this.resetForm();
        this.onCancel.emit();
        this.logger.debug('Formulaire annulé');
    }

    onResetClick(): void {
        this.resetForm();
        if (!this.editMode) {
            this.generateExpenseNumber();
        }
    }

    // ========== Méthodes utilitaires ==========

    private resetForm(): void {
        this.expenseForm.reset();
        this.selectedCategory = null;
        this.selectedSupplier = null;
        this.selectedPaymentMethod = null;
        this.showEuroFields = false;
        this.autoGenerateNumber = true;

        // Remettre les valeurs par défaut
        this.expenseForm.patchValue({
            dateDepense: new Date(),
            devise: Currency.XOF,
            tauxChange: this.DEFAULT_EXCHANGE_RATE,
            statut: ExpenseStatus.EN_ATTENTE
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    // ========== Getters pour le template ==========

    get isFormValid(): boolean {
        return this.expenseForm.valid;
    }

    get isFormDirty(): boolean {
        return this.expenseForm.dirty;
    }

    get numeroControl() {
        return this.expenseForm.get('numero');
    }

    get titreControl() {
        return this.expenseForm.get('titre');
    }

    get descriptionControl() {
        return this.expenseForm.get('description');
    }

    get categorieControl() {
        return this.expenseForm.get('categorieId');
    }

    get montantXOFControl() {
        return this.expenseForm.get('montantXOF');
    }

    get montantEURControl() {
        return this.expenseForm.get('montantEURO');
    }

    get dateDepenseControl() {
        return this.expenseForm.get('dateDepense');
    }

    get paymentMethodControl() {
        return this.expenseForm.get('paymentMethodId');
    }

    // ========== Méthodes pour le template ==========

    getFieldError(fieldName: string): string | null {
        const control = this.expenseForm.get(fieldName);
        if (control?.errors && control.touched) {
            if (control.errors['required']) return `${fieldName} est obligatoire`;
            if (control.errors['minlength']) return `${fieldName} trop court`;
            if (control.errors['maxlength']) return `${fieldName} trop long`;
            if (control.errors['min']) return `Valeur minimale non respectée`;
            if (control.errors['notUnique']) return `Ce numéro existe déjà`;
        }
        return null;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.expenseForm.get(fieldName);
        return !!(control?.invalid && control.touched);
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

    protected readonly Currency = Currency;
}
