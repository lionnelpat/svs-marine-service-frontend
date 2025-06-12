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
import { FormErrorUtils } from '../../../../core/utilities/form-error.utils';
import { Toast } from 'primeng/toast';
import { PaymentMethod, PaymentMethodCreate } from '../../interfaces/payment-method.interface';
import { PaymentMethodService } from '../../service/payment-method.service';
import { PAYMENT_METHOD_KEY } from '../../constants/constants';


@Component({
    selector: 'app-payment-method-form',
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
    templateUrl: './payment-method-form.component.html',
    styleUrl: './payment-method-form.component.scss'
})
export class PaymentMethodFormComponent implements OnInit, OnChanges {
    @Input() paymentMethod: PaymentMethod | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<PaymentMethod>();
    @Output() formCancel = new EventEmitter<void>();

    paymentMethodForm!: FormGroup;
    loading = false;
    isEditMode = false;


    constructor(
        private readonly fb: FormBuilder,
        private readonly paymentMethodService: PaymentMethodService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['paymentMethod'] && this.paymentMethod) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.paymentMethodForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            code: ['', [Validators.required, Validators.minLength(2)]],
            description: ['']
        });

        this.updateForm();
    }

    private updateForm(): void {
        if (this.paymentMethod) {
            this.isEditMode = true;
            this.paymentMethodForm.patchValue({
                nom: this.paymentMethod.nom,
                code: this.paymentMethod.code,
                description: this.paymentMethod.description
            });
        } else {
            this.isEditMode = false;
            this.paymentMethodForm.reset();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.paymentMethodForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }


    onSubmit(): void {
        if (this.paymentMethodForm.valid) {
            this.loading = true;
            const formValue = this.paymentMethodForm.value;

            if (this.isEditMode && this.paymentMethod) {

                this.paymentMethodService.updatePaymentMethod(this.paymentMethod.id, this.paymentMethod).subscribe({
                    next: (paymentMethod) => {
                        this.messageService.add({
                            key: PAYMENT_METHOD_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Méthode de paiement  modifiée avec succès`
                        });
                        this.formSubmit.emit(paymentMethod);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.paymentMethodForm, error.error.details);
                        }

                        this.messageService.add({
                            key: PAYMENT_METHOD_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            } else {
                const createRequest: PaymentMethodCreate = formValue;

                this.paymentMethodService.createPaymentMethod(createRequest).subscribe({
                    next: (paymentMethod) => {
                        this.messageService.add({
                            key: PAYMENT_METHOD_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Méthode de paiement créée avec succès`
                        });
                        this.formSubmit.emit(paymentMethod);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la création', error);
                        if (error?.error?.details) {
                            FormErrorUtils.applyServerErrors(this.paymentMethodForm, error.error.details);
                        }

                        this.messageService.add({
                            key: PAYMENT_METHOD_KEY,
                            severity: 'error',
                            summary: 'Erreur',
                            detail: getErrorMessage(error)
                        });
                    }
                });
            }
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.paymentMethodForm.controls).forEach(key => {
                this.paymentMethodForm.get(key)?.markAsTouched();
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
        this.paymentMethodForm.patchValue({ code: value }, { emitEvent: false });
    }



    onCancel(): void {
        this.resetForm();
        this.formCancel.emit();
    }

    private resetForm(): void {
        this.paymentMethodForm.reset();
        this.isEditMode = false;
        this.paymentMethod = null;
    }

    protected readonly PAYMENT_METHOD_KEY = PAYMENT_METHOD_KEY;
}
