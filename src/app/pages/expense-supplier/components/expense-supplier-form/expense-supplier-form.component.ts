import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../../../core/services/logger.service';
import { Textarea } from 'primeng/textarea';
import { getErrorMessage } from '../../../../core/utilities/error';
import { FormErrorUtils } from '../../../../core/utilities/form-error.utils';
import { Toast } from 'primeng/toast';
import { ExpenseSupplier, ExpenseSupplierCreate } from '../../interfaces/expense-supplier.interface';
import { ExpenseSupplierService } from '../../service/expense-supplier.service';
import { EXPENSE_SUPPLIER_KEY } from '../../constants/constants';

interface IconOption {
    label: string;
    value: string;
    icon: string;
}

@Component({
    selector: 'app-expense-supplier-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        DividerModule,
        Textarea,
        Toast
    ],
    standalone: true,
    providers: [ConfirmationService, MessageService],
    templateUrl: './expense-supplier-form.component.html',
    styleUrl: './expense-supplier-form.component.scss'
})
export class ExpenseSupplierFormComponent implements OnInit, OnChanges {
    @Input() expenseSupplier: ExpenseSupplier | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<ExpenseSupplier>();
    @Output() formCancel = new EventEmitter<void>();

    expenseSupplierForm!: FormGroup;
    loading = false;
    isEditMode = false;


    constructor(
        private readonly fb: FormBuilder,
        private readonly expenseSupplierService: ExpenseSupplierService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['expenseSupplier'] && this.expenseSupplier) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.expenseSupplierForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            adresse: ['', [Validators.required, Validators.minLength(2)]],
            telephone: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            ninea: [''],
            rccm: ['']
        });

        this.updateForm();
    }

    private updateForm(): void {
        if (this.expenseSupplier) {
            this.isEditMode = true;
            this.expenseSupplierForm.patchValue({
                nom: this.expenseSupplier.nom,
                adresse: this.expenseSupplier.adresse,
                telephone: this.expenseSupplier.telephone,
                email: this.expenseSupplier.email,
                ninea: this.expenseSupplier.ninea,
                rccm: this.expenseSupplier.rccm,
            });
        } else {
            this.isEditMode = false;
            this.expenseSupplierForm.reset();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.expenseSupplierForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.expenseSupplierForm.valid) {
            this.loading = true;
            const formValue = this.expenseSupplierForm.value;

            if (this.isEditMode && this.expenseSupplier) {

                this.expenseSupplierService.updateSupplier(this.expenseSupplier.id, this.expenseSupplier).subscribe({
                    next: (updatedCompany) => {
                        this.messageService.add({
                            key: EXPENSE_SUPPLIER_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Fournisseur "${updatedCompany.nom}" modifiée avec succès`
                        });
                        this.formSubmit.emit(updatedCompany);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.expenseSupplierForm, error.error.details);
                        }

                        this.messageService.add({
                            key: EXPENSE_SUPPLIER_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            } else {
                const createRequest: ExpenseSupplierCreate = formValue;

                this.expenseSupplierService.createSupplier(createRequest).subscribe({
                    next: (newSupplier) => {
                        this.messageService.add({
                            key: EXPENSE_SUPPLIER_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Fournisseur "${newSupplier.nom}" créée avec succès`
                        });
                        this.formSubmit.emit(newSupplier);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la création', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.expenseSupplierForm, error.error.details);
                        }

                        this.messageService.add({
                            key: EXPENSE_SUPPLIER_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            }
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.expenseSupplierForm.controls).forEach(key => {
                this.expenseSupplierForm.get(key)?.markAsTouched();
            });

            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez corriger les erreurs dans le formulaire'
            });
        }
    }

    onCodeChange(event: any): void {
        const value = event.target.value.toUpperCase();
        this.expenseSupplierForm.patchValue({ code: value }, { emitEvent: false });
    }



    onCancel(): void {
        this.resetForm();
        this.formCancel.emit();
    }

    private resetForm(): void {
        this.expenseSupplierForm.reset();
        this.isEditMode = false;
        this.expenseSupplier = null;
    }

    protected readonly EXPENSE_SUPPLIER_KEY = EXPENSE_SUPPLIER_KEY;
}
