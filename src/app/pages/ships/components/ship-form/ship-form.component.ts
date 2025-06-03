// pages/ships/components/ship-form/ship-form.component.ts - VERSION COMPLÈTE
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
    template: `
    <form [formGroup]="shipForm" (ngSubmit)="onSubmit()" class="ship-form">
      <!-- Informations générales -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="pi pi-send mr-2"></i>
          Informations générales
        </h4>

        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="nom" class="field-label">
              Nom du navire <span class="required">*</span>
            </label>
            <input
              id="nom"
              pInputText
              formControlName="nom"
              placeholder="Ex: DAKAR EXPRESS"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('nom')"
            />
            <small class="field-error" *ngIf="isFieldInvalid('nom')">
              Le nom du navire est obligatoire
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="compagnieId" class="field-label">
              Compagnie propriétaire <span class="required">*</span>
            </label>
            <p-dropdown
              id="compagnieId"
              formControlName="compagnieId"
              [options]="companyOptions"
              placeholder="Sélectionner une compagnie"
              optionLabel="label"
              optionValue="value"
              [filter]="true"
              filterBy="label"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('compagnieId')"
            ></p-dropdown>
            <small class="field-error" *ngIf="isFieldInvalid('compagnieId')">
              La compagnie est obligatoire
            </small>
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-4">
            <label for="typeNavire" class="field-label">
              Type de navire <span class="required">*</span>
            </label>
            <p-dropdown
              id="typeNavire"
              formControlName="typeNavire"
              [options]="shipTypeOptions"
              placeholder="Sélectionner le type"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('typeNavire')"
              (onChange)="onShipTypeChange($event)"
            ></p-dropdown>
            <small class="field-error" *ngIf="isFieldInvalid('typeNavire')">
              Le type de navire est obligatoire
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="pavillon" class="field-label">
              Pavillon <span class="required">*</span>
            </label>
            <p-dropdown
              id="pavillon"
              formControlName="pavillon"
              [options]="flagOptions"
              placeholder="Sélectionner le pavillon"
              [filter]="true"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('pavillon')"
            ></p-dropdown>
            <small class="field-error" *ngIf="isFieldInvalid('pavillon')">
              Le pavillon est obligatoire
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="portAttache" class="field-label">
              Port d'attache <span class="required">*</span>
            </label>
            <input
              id="portAttache"
              pInputText
              formControlName="portAttache"
              placeholder="Ex: Dakar"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('portAttache')"
            />
            <small class="field-error" *ngIf="isFieldInvalid('portAttache')">
              Le port d'attache est obligatoire
            </small>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Identification -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="pi pi-id-card mr-2"></i>
          Identification
        </h4>

        <div class="grid">
          <div class="col-12 md:col-4">
            <label for="numeroIMO" class="field-label">
              Numéro IMO <span class="required">*</span>
            </label>
            <input
              id="numeroIMO"
              pInputText
              formControlName="numeroIMO"
              placeholder="Ex: 9876543"
              class="w-full imo-input"
              [class.ng-invalid]="isFieldInvalid('numeroIMO')"
              maxlength="7"
            />
            <small class="field-error" *ngIf="isFieldInvalid('numeroIMO')">
              <span *ngIf="shipForm.get('numeroIMO')?.hasError('required')">
                Le numéro IMO est obligatoire
              </span>
              <span *ngIf="shipForm.get('numeroIMO')?.hasError('pattern')">
                Format invalide (7 chiffres)
              </span>
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="numeroMMSI" class="field-label">
              Numéro MMSI <span class="required">*</span>
            </label>
            <input
              id="numeroMMSI"
              pInputText
              formControlName="numeroMMSI"
              placeholder="Ex: 663001234"
              class="w-full mmsi-input"
              [class.ng-invalid]="isFieldInvalid('numeroMMSI')"
              maxlength="9"
            />
            <small class="field-error" *ngIf="isFieldInvalid('numeroMMSI')">
              <span *ngIf="shipForm.get('numeroMMSI')?.hasError('required')">
                Le numéro MMSI est obligatoire
              </span>
              <span *ngIf="shipForm.get('numeroMMSI')?.hasError('pattern')">
                Format invalide (9 chiffres)
              </span>
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="numeroAppel" class="field-label">
              Indicatif d'appel <span class="required">*</span>
            </label>
            <input
              id="numeroAppel"
              pInputText
              formControlName="numeroAppel"
              placeholder="Ex: DAEX"
              class="w-full call-sign-input"
              [class.ng-invalid]="isFieldInvalid('numeroAppel')"
              (input)="onCallSignChange($event)"
              maxlength="8"
            />
            <small class="field-error" *ngIf="isFieldInvalid('numeroAppel')">
              L'indicatif d'appel est obligatoire
            </small>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Dimensions et caractéristiques -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="pi pi-ruler mr-2"></i>
          Dimensions et caractéristiques
        </h4>

        <div class="grid">
          <div class="col-12 md:col-4">
            <label for="longueur" class="field-label">
              Longueur (m) <span class="required">*</span>
            </label>
            <p-inputNumber
              id="longueur"
              formControlName="longueur"
              mode="decimal"
              [minFractionDigits]="1"
              [maxFractionDigits]="2"
              [min]="1"
              [max]="500"
              placeholder="0.0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('longueur')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('longueur')">
              La longueur doit être positive
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="largeur" class="field-label">
              Largeur (m) <span class="required">*</span>
            </label>
            <p-inputNumber
              id="largeur"
              formControlName="largeur"
              mode="decimal"
              [minFractionDigits]="1"
              [maxFractionDigits]="2"
              [min]="1"
              [max]="100"
              placeholder="0.0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('largeur')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('largeur')">
              La largeur doit être positive
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="tirantEau" class="field-label">
              Tirant d'eau (m) <span class="required">*</span>
            </label>
            <p-inputNumber
              id="tirantEau"
              formControlName="tirantEau"
              mode="decimal"
              [minFractionDigits]="1"
              [maxFractionDigits]="2"
              [min]="0.1"
              [max]="30"
              placeholder="0.0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('tirantEau')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('tirantEau')">
              Le tirant d'eau doit être positif
            </small>
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-4">
            <label for="tonnageBrut" class="field-label">
              Tonnage brut <span class="required">*</span>
            </label>
            <p-inputNumber
              id="tonnageBrut"
              formControlName="tonnageBrut"
              [useGrouping]="true"
              [min]="1"
              placeholder="0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('tonnageBrut')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('tonnageBrut')">
              Le tonnage brut doit être positif
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="tonnageNet" class="field-label">
              Tonnage net <span class="required">*</span>
            </label>
            <p-inputNumber
              id="tonnageNet"
              formControlName="tonnageNet"
              [useGrouping]="true"
              [min]="1"
              placeholder="0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('tonnageNet')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('tonnageNet')">
              <span *ngIf="shipForm.get('tonnageNet')?.hasError('required')">
                Le tonnage net est obligatoire
              </span>
              <span *ngIf="shipForm.get('tonnageNet')?.hasError('min')">
                Le tonnage net doit être positif
              </span>
              <span *ngIf="shipForm.hasError('tonnageInvalid')">
                Le tonnage net doit être inférieur au tonnage brut
              </span>
            </small>
          </div>

          <div class="col-12 md:col-4">
            <label for="nombrePassagers" class="field-label">
              Nombre de passagers
              <span class="required" *ngIf="isPassengerShip">*</span>
            </label>
            <p-inputNumber
              id="nombrePassagers"
              formControlName="nombrePassagers"
              [useGrouping]="true"
              [min]="0"
              placeholder="0"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('nombrePassagers')"
            ></p-inputNumber>
            <small class="field-info" *ngIf="isPassengerShip">
              Obligatoire pour les navires à passagers
            </small>
            <small class="field-error" *ngIf="isFieldInvalid('nombrePassagers')">
              Le nombre de passagers est obligatoire pour ce type de navire
            </small>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Construction et classification -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="pi pi-wrench mr-2"></i>
          Construction et classification
        </h4>

        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="anneConstruction" class="field-label">
              Année de construction <span class="required">*</span>
            </label>
            <p-inputNumber
              id="anneConstruction"
              formControlName="anneConstruction"
              [useGrouping]="false"
              [min]="1900"
              [max]="currentYear"
              placeholder="YYYY"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('anneConstruction')"
            ></p-inputNumber>
            <small class="field-error" *ngIf="isFieldInvalid('anneConstruction')">
              Année invalide (1900 - {{ currentYear }})
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="classification" class="field-label">
              Société de classification <span class="required">*</span>
            </label>
            <p-dropdown
              id="classification"
              formControlName="classification"
              [options]="classificationOptions"
              placeholder="Sélectionner la classification"
              [filter]="true"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('classification')"
            ></p-dropdown>
            <small class="field-error" *ngIf="isFieldInvalid('classification')">
              La société de classification est obligatoire
            </small>
          </div>
        </div>

        <div class="grid">
          <div class="col-12">
            <label for="chantierConstruction" class="field-label">
              Chantier de construction <span class="required">*</span>
            </label>
            <input
              id="chantierConstruction"
              pInputText
              formControlName="chantierConstruction"
              placeholder="Ex: Chantiers Navals de Dakar"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('chantierConstruction')"
            />
            <small class="field-error" *ngIf="isFieldInvalid('chantierConstruction')">
              Le chantier de construction est obligatoire
            </small>
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
          (click)="onCancel()"
        ></button>
        <button
          type="submit"
          pButton
          [label]="isEditMode ? 'Modifier' : 'Créer'"
          [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
          [loading]="loading"
          [disabled]="shipForm.invalid"
          class="ml-2"
          style="background-color: var(--svs-primary); border-color: var(--svs-primary)"
        ></button>
      </div>
    </form>
  `,
    styles: [`
    .ship-form {
      .form-section {
        margin-bottom: 1.5rem;
      }

      .section-title {
        color: var(--svs-primary);
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
      }

      .field-label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--svs-text);
      }

      .required {
        color: #ef4444;
      }

      .field-error {
        color: #ef4444;
        display: block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
      }

      .field-info {
        color: var(--svs-accent);
        display: block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
      }

      .imo-input,
      .mmsi-input,
      .call-sign-input {
        font-family: 'Courier New', monospace;
        text-transform: uppercase;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--svs-surface-dark);
      }

      ::ng-deep {
        .ng-invalid.ng-touched {
          border-color: #ef4444 !important;
        }

        .p-dropdown.ng-invalid.ng-touched {
          .p-dropdown-label {
            border-color: #ef4444 !important;
          }
        }

        .p-inputnumber.ng-invalid.ng-touched {
          .p-inputtext {
            border-color: #ef4444 !important;
          }
        }

        .p-button:disabled {
          opacity: 0.6;
        }
      }
    }
  `]
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
            longueur: [null, [Validators.required, Validators.min(1)]],
            largeur: [null, [Validators.required, Validators.min(1)]],
            tirantEau: [null, [Validators.required, Validators.min(0.1)]],
            tonnageBrut: [null, [Validators.required, Validators.min(1)]],
            tonnageNet: [null, [Validators.required, Validators.min(1)]],
            nombrePassagers: [null],
            anneConstruction: [null, [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]],
            chantierConstruction: ['', [Validators.required, Validators.minLength(3)]],
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

    private initializeOptions(): void {
        // Options types de navires
        this.shipTypeOptions = SHIP_TYPES.map(type => ({
            label: type,
            value: type
        }));

        // Options pavillons
        this.flagOptions = SHIP_FLAGS.map(flag => ({
            label: flag,
            value: flag
        }));

        // Options classifications
        this.classificationOptions = SHIP_CLASSIFICATIONS.map(classification => ({
            label: classification,
            value: classification
        }));

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
                longueur: this.ship.longueur,
                largeur: this.ship.largeur,
                tirantEau: this.ship.tirantEau,
                tonnageBrut: this.ship.tonnageBrut,
                tonnageNet: this.ship.tonnageNet,
                nombrePassagers: this.ship.nombrePassagers || null,
                anneConstruction: this.ship.anneConstruction,
                chantierConstruction: this.ship.chantierConstruction,
                classification: this.ship.classification
            });
            this.checkPassengerShip(this.ship.typeNavire);
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
        this.checkPassengerShip(shipType);
    }

    private checkPassengerShip(shipType: string): void {
        this.isPassengerShip = ['Passagers', 'Ro-Ro'].includes(shipType);

        const nombrePassagersControl = this.shipForm.get('nombrePassagers');
        if (this.isPassengerShip) {
            nombrePassagersControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
            nombrePassagersControl?.setValidators([Validators.min(0)]);
        }
        nombrePassagersControl?.updateValueAndValidity();
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
