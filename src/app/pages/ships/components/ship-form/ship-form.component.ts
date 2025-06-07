// pages/ships/components/ship-form/ship-form.component.ts - VERSION COMPLÈTE
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { Ship, CreateShipRequest, UpdateShipRequest, SHIP_TYPES, SHIP_FLAGS, SHIP_CLASSIFICATIONS } from '../../../../shared/models/ship.model';
import { ShipService } from '../../../service/ship.service';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-ship-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        DividerModule,
        CalendarModule
    ],
    templateUrl: './ship-form.component.html',
    styleUrls: ['./ship-form.component.scss']
})
export class ShipFormComponent implements OnInit, OnChanges {
    @Input() ship: Ship | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<Ship>();
    @Output() formCancel = new EventEmitter<void>();

    shipForm!: FormGroup;
    loading = false;
    isEditMode = false;
    currentYear = new Date().getFullYear();

    // Options pour les dropdowns
    companyOptions: any[] = [];
    shipTypeOptions: any[] = [];
    flagOptions: any[] = [];
    classificationOptions: any[] = [];

    // État pour navire à passagers
    isPassengerShip = false;

    constructor(
        private fb: FormBuilder,
        private shipService: ShipService,
        private companyService: CompanyService,
        private messageService: MessageService,
        private logger: LoggerService
    ) {
        this.initForm();
        this.initializeOptions();
    }

    ngOnInit(): void {
        this.initForm();

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['ship'] && this.shipForm) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.shipForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            compagnieId: [null, [Validators.required]],
            typeNavire: ['', [Validators.required]],
            pavillon: ['', [Validators.required]],
            portAttache: ['', [Validators.required]],
            numeroIMO: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
            numeroMMSI: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
            numeroAppel: ['', [Validators.required, Validators.minLength(2)]],
            classification: ['', [Validators.required]]
        });

        // Validation personnalisée pour tonnage net < tonnage brut
        // this.shipForm.addValidators(this.tonnageValidator);

        this.updateForm();
    }

    private tonnageValidator = (form: FormGroup) => {
        const tonnageBrut = form.get('tonnageBrut')?.value;
        const tonnageNet = form.get('tonnageNet')?.value;

        if (tonnageBrut && tonnageNet && tonnageNet >= tonnageBrut) {
            return { tonnageInvalid: true };
        }

        return null;
    };

    private  initializeOptions(): void {

        // Options types de navires
        // this.shipTypeOptions = SHIP_TYPES.map(type => ({
        //     label: type,
        //     value: type
        // }));
        this.shipService.getShipTypes().subscribe({
            next: data => {
                this.shipTypeOptions = data;
            }
        })

        // Options pavillons
        this.flagOptions = SHIP_FLAGS.map(flag => ({
            label: flag,
            value: flag
        }));

        this.shipService.getFlag().subscribe({
            next: data => {
                this.flagOptions = data;
            }
        })

        // Options classifications
        // this.classificationOptions = SHIP_CLASSIFICATIONS.map(classification => ({
        //     label: classification,
        //     value: classification
        // }));

        this.shipService.getClassifications().subscribe({
            next: data => {
                this.classificationOptions = data;
            }
        })

        // Charger les compagnies
        this.companyService.getCompanies().subscribe({
            next: (response) => {
                this.companyOptions = response.companies
                    .filter(company => company.active)
                    .map(company => ({
                        label: company.nom,
                        value: company.id
                    }));
            },
            error: (error) => {
                this.logger.error('Erreur lors du chargement des compagnies', error);
            }
        });
    }

    private updateForm(): void {
        if (this.ship) {
            this.isEditMode = true;
            this.shipForm.patchValue({
                nom: this.ship.nom,
                compagnieId: this.ship.compagnieId,
                typeNavire: this.ship.typeNavire,
                pavillon: this.ship.pavillon,
                portAttache: this.ship.portAttache,
                numeroIMO: this.ship.numeroIMO,
                numeroMMSI: this.ship.numeroMMSI,
                numeroAppel: this.ship.numeroAppel,
                classification: this.ship.classification
            });
        } else {
            this.isEditMode = false;
            this.shipForm.reset();
            this.isPassengerShip = false;
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.shipForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onCallSignChange(event: any): void {
        const value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        this.shipForm.patchValue({ numeroAppel: value }, { emitEvent: false });
    }

    onShipTypeChange(event: any): void {
        const shipType = event.value;
    }

    onSubmit(): void {
        if (this.shipForm.valid) {
            this.loading = true;
            const formValue = this.shipForm.value;

            if (this.isEditMode && this.ship) {
                const updateRequest: UpdateShipRequest = {
                    id: this.ship.id,
                    ...formValue
                };

                this.shipService.updateShip(updateRequest).subscribe({
                    next: (updatedShip) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Navire "${updatedShip.nom}" modifié avec succès`
                        });
                        this.formSubmit.emit(updatedShip);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                    }
                });
            } else {
                const createRequest: CreateShipRequest = formValue;

                this.shipService.createShip(createRequest).subscribe({
                    next: (newShip) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Navire "${newShip.nom}" créé avec succès`
                        });
                        this.formSubmit.emit(newShip);
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
            Object.keys(this.shipForm.controls).forEach(key => {
                this.shipForm.get(key)?.markAsTouched();
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
        this.shipForm.reset();
        this.isEditMode = false;
        this.ship = null;
        this.isPassengerShip = false;
    }
}
