// src/app/pages/invoices/components/invoice-form/invoice-form.component.ts

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { InvoiceService } from '../../../service/invoice.service';
import { LoggerService } from '../../../../core/services/logger.service';

// Models
import {
    CreateInvoiceRequest,
    Invoice,
    InvoiceLineItem,
    TVA_RATES,
    UpdateInvoiceRequest
} from '../../../../shared/models/invoice.model';
import { Company } from '../../../../shared/models';
import { Ship } from '../../../../shared/models/ship.model';
import { MOCK_COMPANIES, MOCK_OPERATIONS, MOCK_SHIPS } from '../../../../shared/data/invoice.data';
import { Textarea } from 'primeng/textarea';
import { CompanyService } from '../../../service/company.service';
import { ShipService } from '../../../service/ship.service';
import { OperationService } from '../../../service/operation.service';

@Component({
    selector: 'app-invoice-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        InputNumberModule,
        DividerModule,
        MessageModule,
        TooltipModule,
        Textarea
    ],
    templateUrl: './invoice-form.component.html',
    styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent implements OnInit, OnChanges {
    @Input() invoice: Invoice | null = null;
    @Input() editMode = false;

    @Output() onSave = new EventEmitter<CreateInvoiceRequest | UpdateInvoiceRequest>();
    @Output() onCancel = new EventEmitter<void>();

    invoiceForm!: FormGroup;
    saving = false;

    // Options pour les dropdowns
    companyOptions: { label: string; value: number }[] = [];
    shipOptions: { label: string; value: number }[] = [];
    operationOptions: { label: string; value: number }[] = [];
    tvaRateOptions = TVA_RATES;

    // Objets sélectionnés
    selectedCompany: Company | null = null;
    selectedShip: Ship | null = null;

    // Calculs
    sousTotal = 0;
    tva = 0;
    montantTotal = 0;

    constructor(
        private readonly fb: FormBuilder,
        private readonly invoiceService: InvoiceService,
        private readonly companyService: CompanyService,
        private readonly shipService: ShipService,
        private readonly operationService: OperationService,
        private readonly logger: LoggerService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.initializeOptions();
        this.generateInvoiceNumber();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['invoice'] && this.invoice) {
            this.populateForm();
        }
    }

    private initializeForm(): void {
        this.invoiceForm = this.fb.group({
            numero: ['', Validators.required],
            dateFacture: [new Date(), Validators.required],
            dateEcheance: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required], // +30 jours
            compagnieId: [null, Validators.required],
            navireId: [null, Validators.required],
            prestations: this.fb.array([]),
            tauxTva: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
            notes: ['']
        });

        // Observer les changements pour recalculer les totaux
        this.invoiceForm.valueChanges.subscribe(() => {
            this.calculateTotals();
        });
    }

    private initializeOptions(): void {
        // Options des compagnies
        this.companyService.getCompanies().subscribe((response) => {
            this.companyOptions =response.companies.map(company => ({
                label: company.nom,
                value: company.id
            }));
        });


        // Options des navires
        this.shipService.getActiveShips().subscribe((resp) => {
            this.shipOptions = resp.ships.map(ship => ({
                label: `${ship.nom} (IMO: ${ship.numeroIMO})`,
                value: ship.id
            }));
        });



        // Options des opérations
        this.operationService.getOperations().subscribe((resp) => {
            this.operationOptions = resp.operations.map(operation => ({
                label: operation.nom,
                value: operation.id
            }));
        })

    }

    private generateInvoiceNumber(): void {
        if (!this.editMode) {
            let invoiceNumber = 'FACT-TEST-001';
             this.invoiceService.getInvoices().subscribe((resp) => {
                 const total = resp.total.toString();
                 invoiceNumber = this.invoiceService.generateInvoiceNumber(total)
                 console.log(` Invoice number generated ${invoiceNumber}`)
                 this.invoiceForm.patchValue({ numero: invoiceNumber });
            });

        }
    }

    private populateForm(): void {
        if (!this.invoice) return;

        this.invoiceForm.patchValue({
            numero: this.invoice.numero,
            dateFacture: new Date(this.invoice.dateFacture),
            dateEcheance: new Date(this.invoice.dateEcheance),
            compagnieId: this.invoice.compagnieId,
            navireId: this.invoice.navireId,
            tauxTva: this.invoice.tauxTva,
            notes: this.invoice.notes || ''
        });

        // Charger les prestations
        this.prestationsArray.clear();
        this.invoice.prestations.forEach(prestation => {
            this.prestationsArray.push(this.createPrestationFormGroup(prestation));
        });

        // Sélectionner les objets
        this.selectedCompany = this.invoice.compagnie || null;
        this.selectedShip = this.invoice.navire || null;

        this.calculateTotals();
    }

    // Gestion du FormArray des prestations
    get prestationsArray(): FormArray {
        return this.invoiceForm.get('prestations') as FormArray;
    }

    addPrestation(): void {
        const prestationGroup = this.createPrestationFormGroup();
        this.prestationsArray.push(prestationGroup);
        this.logger.debug('Prestation ajoutée', { index: this.prestationsArray.length - 1 });
    }

    removePrestation(index: number): void {
        this.prestationsArray.removeAt(index);
        this.calculateTotals();
        this.logger.debug('Prestation supprimée', { index });
    }

    private createPrestationFormGroup(prestation?: InvoiceLineItem): FormGroup {
        return this.fb.group({
            operationId: [prestation?.operationId || null, Validators.required],
            description: [prestation?.description || ''],
            quantite: [prestation?.quantite || 1, [Validators.required, Validators.min(0.01)]],
            prixUnitaireXOF: [prestation?.prixUnitaireXOF || 0, [Validators.required, Validators.min(0)]],
            prixUnitaireEURO: [prestation?.prixUnitaireEURO || null],
            montantXOF: [prestation?.montantXOF || 0],
            montantEURO: [prestation?.montantEURO || null]
        });
    }

    // Gestion des événements de sélection
    onCompanyChange(event: any): void {
        const compagnieId = event.value;
        this.companyService.getCompanies().subscribe((resp) => {
             this.selectedCompany = resp.companies.find(c => c.id === compagnieId) || null;
        })

        // Filtrer les navires de cette compagnie
        if (this.selectedCompany) {
            this.shipService.getShips().subscribe((resp) => {
                this.shipOptions = resp.ships
                    .filter(ship => ship.compagnieId === compagnieId)
                    .map(ship => ({
                        label: `${ship.nom} (IMO: ${ship.numeroIMO})`,
                        value: ship.id
                    }));
                // Reset le navire sélectionné
                this.invoiceForm.patchValue({ navireId: null });
                this.selectedShip = null;
            })

        }

        this.logger.debug('Compagnie sélectionnée', this.selectedCompany);
    }

    onShipChange(event: any): void {
        const navireId = event.value;
        this.shipService.getShips().subscribe((resp) => {
            this.selectedShip = resp.ships.find(s => s.id === navireId) || null;
        });

        this.logger.debug('Navire sélectionné', this.selectedShip);
    }

    onOperationChange(index: number, event: any): void {
        const operationId = event.value;

        this.operationService.getOperations().subscribe((resp) => {
            const operation = resp.operations.find(op => op.id === operationId);
            if (operation) {
                const prestationGroup = this.prestationsArray.at(index);
                prestationGroup.patchValue({
                    description: operation.description,
                    prixUnitaireXOF: operation.prixXOF,
                    prixUnitaireEURO: operation.prixEURO
                });

                this.calculatePrestationTotal(index);
                this.logger.debug('Opération sélectionnée', { index, operation: operation.nom });
            }
        });



    }

    // Calculs
    calculatePrestationTotal(index: number): void {
        const prestationGroup = this.prestationsArray.at(index);
        const quantite = prestationGroup.get('quantite')?.value || 0;
        const prixUnitaireXOF = prestationGroup.get('prixUnitaireXOF')?.value || 0;
        const prixUnitaireEURO = prestationGroup.get('prixUnitaireEURO')?.value || 0;

        const montantXOF = quantite * prixUnitaireXOF;
        const montantEURO = prixUnitaireEURO ? quantite * prixUnitaireEURO : null;

        prestationGroup.patchValue({
            montantXOF,
            montantEURO
        }, { emitEvent: false });

        this.calculateTotals();
    }

    calculateTotals(): void {
        this.sousTotal = this.prestationsArray.controls.reduce((sum, control) => {
            return sum + (control.get('montantXOF')?.value || 0);
        }, 0);

        const tauxTva = this.invoiceForm.get('tauxTva')?.value || 0;
        this.tva = (this.sousTotal * tauxTva) / 100;
        this.montantTotal = this.sousTotal + this.tva;
    }

    // Soumission du formulaire
    onSubmit(): void {
        if (this.invoiceForm.invalid || this.prestationsArray.length === 0) {
            this.markFormGroupTouched(this.invoiceForm);
            return;
        }

        this.saving = true;
        const formValue = this.invoiceForm.value;

        const prestations = formValue.prestations.map((p: any) => ({
            operationId: p.operationId,
            description: p.description,
            quantite: p.quantite,
            prixUnitaireXOF: p.prixUnitaireXOF,
            prixUnitaireEURO: p.prixUnitaireEURO
        }));

        if (this.editMode && this.invoice) {
            const updateRequest: UpdateInvoiceRequest = {
                id: this.invoice.id,
                compagnieId: formValue.compagnieId,
                navireId: formValue.navireId,
                dateFacture: new Date(formValue.dateFacture).toISOString().split('T')[0],
                dateEcheance: new Date(formValue.dateEcheance).toISOString().split('T')[0],
                prestations,
                tauxTva: formValue.tauxTva,
                notes: formValue.notes
            };
            this.onSave.emit(updateRequest);
        } else {
            const createRequest: CreateInvoiceRequest = {
                compagnieId: formValue.compagnieId,
                navireId: formValue.navireId,
                dateFacture: new Date(formValue.dateFacture).toISOString().split('T')[0],
                dateEcheance: new Date(formValue.dateEcheance).toISOString().split('T')[0],
                prestations,
                tauxTva: formValue.tauxTva,
                notes: formValue.notes
            };
            this.onSave.emit(createRequest);
        }

        this.saving = false;
    }

    onCancelCreation(): void {
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

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }
}
