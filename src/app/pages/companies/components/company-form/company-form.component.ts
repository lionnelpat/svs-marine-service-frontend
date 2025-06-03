import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges,
    CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../../../../shared/models/company.model';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-company-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        DividerModule,
        Textarea
    ],
    standalone: true,
    providers: [ConfirmationService, MessageService],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss'
})
export class CompanyFormComponent implements OnInit, OnChanges {
    @Input() company: Company | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<Company>();
    @Output() formCancel = new EventEmitter<void>();

    companyForm!: FormGroup;
    loading = false;
    isEditMode = false;

    countryOptions = [
        { label: 'France', value: 'France' },
        { label: 'Allemagne', value: 'Allemagne' },
        { label: 'Belgique', value: 'Belgique' },
        { label: 'Chine', value: 'Chine' },
        { label: 'Danemark', value: 'Danemark' },
        { label: 'Espagne', value: 'Espagne' },
        { label: 'Italie', value: 'Italie' },
        { label: 'Pays-Bas', value: 'Pays-Bas' },
        { label: 'Royaume-Uni', value: 'Royaume-Uni' },
        { label: 'Singapour', value: 'Singapour' },
        { label: 'Suisse', value: 'Suisse' }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly companyService: CompanyService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['company'] && this.companyForm) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.companyForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            raisonSociale: ['', [Validators.required, Validators.minLength(2)]],
            adresse: ['', [Validators.required]],
            ville: ['', [Validators.required]],
            pays: ['', [Validators.required]],
            codePostal: ['', [Validators.required]],
            telephone: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            contactPrincipal: ['', [Validators.required]],
            telephoneContact: ['', [Validators.required]],
            emailContact: ['', [Validators.required, Validators.email]],
            rccm: [''],
            ninea: [''],
            siteWeb: ['']
        });

        this.updateForm();
    }

    private updateForm(): void {
        if (this.company) {
            this.isEditMode = true;
            this.companyForm.patchValue({
                nom: this.company.nom,
                raisonSociale: this.company.raisonSociale,
                adresse: this.company.adresse,
                ville: this.company.ville,
                pays: this.company.pays,
                telephone: this.company.telephone,
                email: this.company.email,
                contactPrincipal: this.company.contactPrincipal,
                telephoneContact: this.company.telephoneContact,
                emailContact: this.company.emailContact,
                rccm: this.company.rccm || '',
                ninea: this.company.ninea || '',
                siteWeb: this.company.siteWeb
            });
        } else {
            this.isEditMode = false;
            this.companyForm.reset();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.companyForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.companyForm.valid) {
            this.loading = true;
            const formValue = this.companyForm.value;

            if (this.isEditMode && this.company) {
                const updateRequest: UpdateCompanyRequest = {
                    id: this.company.id,
                    ...formValue
                };

                this.companyService.updateCompany(updateRequest).subscribe({
                    next: (updatedCompany) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Compagnie "${updatedCompany.nom}" modifiée avec succès`
                        });
                        this.formSubmit.emit(updatedCompany);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                    }
                });
            } else {
                const createRequest: CreateCompanyRequest = formValue;

                this.companyService.createCompany(createRequest).subscribe({
                    next: (newCompany) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Compagnie "${newCompany.nom}" créée avec succès`
                        });
                        this.formSubmit.emit(newCompany);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la création', error);
                    }
                });
            }
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.companyForm.controls).forEach(key => {
                this.companyForm.get(key)?.markAsTouched();
            });

            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez corriger les erreurs dans le formulaire'
            });
        }
    }

    onCancel(): void {
        this.resetForm();
        this.formCancel.emit();
    }

    private resetForm(): void {
        this.companyForm.reset();
        this.isEditMode = false;
        this.company = null;
    }

}
