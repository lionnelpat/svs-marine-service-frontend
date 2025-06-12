import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../../../core/services/logger.service';
import { Textarea } from 'primeng/textarea';
import { getErrorMessage } from '../../../../core/utilities/error';
import { ExpenseCategory, ExpenseCategoryCreate } from '../../../../shared/models/expense-category.model';
import { ExpenseCategoryService } from '../../service/expense-category.service';
import { EXPENSE_CATEGORY_KEY } from '../../constants/constants';
import { FormErrorUtils } from '../../../../core/utilities/form-error.utils';
import { Toast } from 'primeng/toast';

interface IconOption {
    label: string;
    value: string;
    icon: string;
}

@Component({
    selector: 'app-expense-category-form',
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
    templateUrl: './expense-category-form.component.html',
    styleUrl: './expense-category-form.component.scss'
})
export class ExpenseCategoryFormComponent implements OnInit, OnChanges {
    @Input() expenseCategory: ExpenseCategory | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<ExpenseCategory>();
    @Output() formCancel = new EventEmitter<void>();

    expenseCategoryForm!: FormGroup;
    loading = false;
    isEditMode = false;


    constructor(
        private readonly fb: FormBuilder,
        private readonly expenseCategoryService: ExpenseCategoryService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['expenseCategory'] && this.expenseCategory) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.expenseCategoryForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            code: ['', [Validators.required, Validators.minLength(2)]],
            description: ['']
        });

        this.updateForm();
    }

    private updateForm(): void {
        if (this.expenseCategory) {
            this.isEditMode = true;
            this.expenseCategoryForm.patchValue({
                nom: this.expenseCategory.nom,
                code: this.expenseCategory.code,
                description: this.expenseCategory.description,
            });
        } else {
            this.isEditMode = false;
            this.expenseCategoryForm.reset();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.expenseCategoryForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.expenseCategoryForm.valid) {
            this.loading = true;
            const formValue = this.expenseCategoryForm.value;

            if (this.isEditMode && this.expenseCategory) {

                this.expenseCategoryService.updateCategory(this.expenseCategory.id, formValue).subscribe({
                    next: (updatedCompany) => {
                        this.messageService.add({
                            key: EXPENSE_CATEGORY_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Catégorie "${updatedCompany.nom}" modifiée avec succès`
                        });
                        this.formSubmit.emit(updatedCompany);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.expenseCategoryForm, error.error.details);
                        }

                        this.messageService.add({
                            key: EXPENSE_CATEGORY_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            } else {
                const createRequest: ExpenseCategoryCreate = formValue;

                this.expenseCategoryService.createCategory(createRequest).subscribe({
                    next: (newCompany) => {
                        this.messageService.add({
                            key: EXPENSE_CATEGORY_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Catégorie "${newCompany.nom}" créée avec succès`
                        });
                        this.formSubmit.emit(newCompany);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la création', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.expenseCategoryForm, error.error.details);
                        }

                        this.messageService.add({
                            key: EXPENSE_CATEGORY_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            }
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.expenseCategoryForm.controls).forEach(key => {
                this.expenseCategoryForm.get(key)?.markAsTouched();
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
        this.expenseCategoryForm.patchValue({ code: value }, { emitEvent: false });
    }



    onCancel(): void {
        this.resetForm();
        this.formCancel.emit();
    }

    private resetForm(): void {
        this.expenseCategoryForm.reset();
        this.isEditMode = false;
        this.expenseCategory = null;
    }

    protected readonly EXPENSE_CATEGORY_KEY = EXPENSE_CATEGORY_KEY;
}
