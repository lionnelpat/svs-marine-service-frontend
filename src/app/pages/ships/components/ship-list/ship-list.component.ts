// pages/ships/components/ship-list/ship-list.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Ship, ShipListFilter, SHIP_TYPES, SHIP_FLAGS } from '../../../../shared/models/ship.model';
import { ShipService } from '../../../service/ship.service';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

export interface ShipListEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    ship?: Ship;
}

@Component({
    selector: 'app-ship-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        ConfirmDialogModule,
        TooltipModule,
        BadgeModule,
        ChipModule,
        IconField,
        InputIcon
    ],
    template: `
    <div class="ship-list">
      <!-- En-tête avec filtres -->
      <div class="card">
        <div class="flex flex-column md:flex-row gap-3 mb-4">
          <div class="flex-1">
              <p-iconfield iconPosition="left">
                  <input pInputText type="text" [(ngModel)]="searchTerm"
                         (input)="onSearch()"
                         placeholder="Rechercher par nom, IMO, MMSI, port d'attache..."
                         class="w-full" />
                  <p-inputicon class="pi pi-search" />
              </p-iconfield>
          </div>
          <div class="flex gap-2 flex-wrap">
            <p-dropdown
              [(ngModel)]="selectedCompany"
              [options]="companyOptions"
              placeholder="Toutes les compagnies"
              [showClear]="true"
              (onChange)="onFilter()"
              styleClass="w-12rem"
              optionLabel="label"
              optionValue="value"
            ></p-dropdown>
            <p-dropdown
              [(ngModel)]="selectedShipType"
              [options]="shipTypeOptions"
              placeholder="Tous les types"
              [showClear]="true"
              (onChange)="onFilter()"
              styleClass="w-10rem"
            ></p-dropdown>
            <p-dropdown
              [(ngModel)]="selectedFlag"
              [options]="flagOptions"
              placeholder="Tous les pavillons"
              [showClear]="true"
              (onChange)="onFilter()"
              styleClass="w-10rem"
            ></p-dropdown>
            <p-dropdown
              [(ngModel)]="selectedStatus"
              [options]="statusOptions"
              placeholder="Tous les statuts"
              [showClear]="true"
              (onChange)="onFilter()"
              styleClass="w-10rem"
            ></p-dropdown>
            <button
              pButton
              type="button"
              label="Nouveau navire"
              icon="pi pi-plus"
              class="p-button-raised"
              (click)="onCreate()"
              style="background-color: var(--svs-primary)"
            ></button>
          </div>
        </div>
      </div>

      <!-- Tableau des navires -->
      <div class="card">
        <p-table
          [value]="ships"
          [loading]="loading"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          responsiveLayout="scroll"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} navires"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-gridlines"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem">#</th>
              <th pSortableColumn="nom">
                Navire <p-sortIcon field="nom"></p-sortIcon>
              </th>
              <th pSortableColumn="numeroIMO">
                N° IMO <p-sortIcon field="numeroIMO"></p-sortIcon>
              </th>
              <th>Type & Pavillon</th>
              <th>Dimensions</th>
              <th>Tonnage</th>
              <th pSortableColumn="compagnieId">
                Compagnie <p-sortIcon field="compagnieId"></p-sortIcon>
              </th>
              <th pSortableColumn="active">
                Statut <p-sortIcon field="active"></p-sortIcon>
              </th>
              <th style="width: 12rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-ship let-rowIndex="rowIndex">
            <tr>
              <td>
                <span class="font-medium text-color-secondary">
                  {{ (currentPage * pageSize) + rowIndex + 1 }}
                </span>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="font-semibold text-primary">{{ ship.nom }}</span>
                  <small class="text-color-secondary">
                    <i class="pi pi-map-marker mr-1"></i>{{ ship.portAttache }}
                  </small>
                  <small class="text-color-secondary mt-1">
                    <i class="pi pi-calendar mr-1"></i>{{ ship.anneConstruction }}
                  </small>
                </div>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="font-semibold ship-imo">{{ ship.numeroIMO }}</span>
                  <small class="text-color-secondary">MMSI: {{ ship.numeroMMSI }}</small>
                  <small class="text-color-secondary">{{ ship.numeroAppel }}</small>
                </div>
              </td>
              <td>
                <div class=" flex flex-col gap-1">
                  <p-chip
                    [label]="ship.typeNavire"
                    [style]="{'background-color': getTypeColor(ship.typeNavire), 'color': 'white'}"
                  ></p-chip>
                  <p-chip
                    [label]="ship.pavillon"
                    styleClass="flag-chip"
                  ></p-chip>
                </div>
              </td>
              <td>
                <div class="dimensions-info">
                  <div class="dimension-item">
                    <small class="label">L:</small>
                    <span>{{ ship.longueur }}m</span>
                  </div>
                  <div class="dimension-item">
                    <small class="label">l:</small>
                    <span>{{ ship.largeur }}m</span>
                  </div>
                  <div class="dimension-item">
                    <small class="label">TE:</small>
                    <span>{{ ship.tirantEau }}m</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="tonnage-info">
                  <div class="tonnage-item">
                    <small class="label">TB:</small>
                    <span>{{ formatNumber(ship.tonnageBrut) }}</span>
                  </div>
                  <div class="tonnage-item">
                    <small class="label">TN:</small>
                    <span>{{ formatNumber(ship.tonnageNet) }}</span>
                  </div>
                  <div class="tonnage-item" *ngIf="ship.nombrePassagers">
                    <small class="label">PAX:</small>
                    <span>{{ ship.nombrePassagers }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="company-name">{{ getCompanyName(ship.compagnieId) }}</span>
              </td>
              <td>
                <p-tag
                  [value]="ship.active ? 'Actif' : 'Inactif'"
                  [severity]="ship.active ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <button
                    pButton
                    type="button"
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-text p-button-sm"
                    (click)="onView(ship)"
                    pTooltip="Voir les détails"
                    tooltipPosition="top"
                  ></button>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-sm"
                    (click)="onEdit(ship)"
                    pTooltip="Modifier"
                    tooltipPosition="top"
                    style="color: var(--svs-accent)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    [icon]="ship.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    class="p-button-rounded p-button-text p-button-sm"
                    (click)="onToggleStatus(ship)"
                    [pTooltip]="ship.active ? 'Désactiver' : 'Activer'"
                    tooltipPosition="top"
                    style="color: var(--svs-primary-light)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-sm p-button-danger"
                    (click)="onDelete(ship)"
                    pTooltip="Supprimer"
                    tooltipPosition="top"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-send empty-icon"></i>
                  <h4>Aucun navire trouvé</h4>
                  <p>{{ getEmptyMessage() }}</p>
                  <button
                    *ngIf="hasActiveFilters()"
                    pButton
                    type="button"
                    label="Effacer les filtres"
                    icon="pi pi-filter-slash"
                    class="p-button-text"
                    (click)="clearFilters()"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
    styles: [`
    .ship-list {
      .card {
        background: var(--svs-surface);
        border: 1px solid var(--svs-surface-dark);
        border-radius: 6px;
        padding: 1.5rem;
        margin-bottom: 1rem;
      }

      .ship-imo {
        font-family: 'Courier New', monospace;
        color: var(--svs-primary);
        font-weight: 600;
      }

      .dimensions-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .dimension-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;

          .label {
            font-weight: 600;
            color: var(--svs-text);
            opacity: 0.7;
            min-width: 1.5rem;
          }

          span {
            font-size: 0.9rem;
            color: var(--svs-text);
          }
        }
      }

      .tonnage-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .tonnage-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;

          .label {
            font-weight: 600;
            color: var(--svs-accent);
            opacity: 0.8;
            min-width: 2rem;
            font-size: 0.8rem;
          }

          span {
            font-size: 0.9rem;
            color: var(--svs-text);
            font-weight: 500;
          }
        }
      }

      .company-name {
        font-weight: 500;
        color: var(--svs-primary);
      }

      .empty-state {
        padding: 3rem 1rem;
        text-align: center;

        .empty-icon {
          font-size: 3rem;
          color: var(--svs-text);
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        h4 {
          color: var(--svs-text);
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
        }

        p {
          color: var(--svs-text);
          opacity: 0.7;
          margin: 0 0 1rem 0;
        }
      }

      ::ng-deep {
        .p-chip {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;

          &.flag-chip {
            background-color: var(--svs-surface-dark);
            color: var(--svs-text);
          }
        }

        .p-datatable {
          .p-datatable-thead > tr > th {
            background: var(--svs-surface);
            color: var(--svs-text);
            border-color: var(--svs-surface-dark);
            font-weight: 600;
          }

          .p-datatable-tbody > tr > td {
            border-color: var(--svs-surface-dark);
          }

          .p-datatable-tbody > tr:hover {
            background: var(--svs-surface-dark);
          }
        }

        .p-button.p-button-raised {
          background-color: var(--svs-primary);
          border-color: var(--svs-primary);

          &:hover {
            background-color: var(--svs-primary-light);
            border-color: var(--svs-primary-light);
          }
        }

        .p-tag.p-tag-success {
          background-color: #10b981;
          color: white;
        }

        .p-tag.p-tag-danger {
          background-color: #ef4444;
          color: white;
        }
      }
    }
  `]
})
export class ShipListComponent implements OnInit {
    @Output() shipEvent = new EventEmitter<ShipListEvent>();

    ships: Ship[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedCompany: number | null = null;
    selectedShipType: string | null = null;
    selectedFlag: string | null = null;
    selectedStatus: boolean | null = null;

    // Options pour les dropdowns
    companyOptions: any[] = [];
    shipTypeOptions: any[] = [];
    flagOptions: any[] = [];
    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    // Map des compagnies pour affichage
    private companiesMap = new Map<number, string>();

    constructor(
        private shipService: ShipService,
        private companyService: CompanyService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.initializeOptions();
        this.loadShips();
    }

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

        // Charger les compagnies
        this.companyService.getCompanies().subscribe({
            next: (response) => {
                this.companyOptions = response.companies.map(company => ({
                    label: company.nom,
                    value: company.id
                }));

                // Créer le map pour l'affichage
                response.companies.forEach(company => {
                    this.companiesMap.set(company.id, company.nom);
                });
            },
            error: (error) => {
                this.logger.error('Erreur lors du chargement des compagnies', error);
            }
        });
    }

    loadShips(): void {
        this.loading = true;

        const filter: ShipListFilter = {
            search: this.searchTerm || undefined,
            compagnieId: this.selectedCompany || undefined,
            typeNavire: this.selectedShipType || undefined,
            pavillon: this.selectedFlag || undefined,
            active: this.selectedStatus !== null ? this.selectedStatus : undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.shipService.getShips(filter).subscribe({
            next: (response) => {
                this.ships = response.ships;
                this.totalRecords = response.total;
                this.loading = false;
                this.logger.debug(`${response.ships.length} navires chargés`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des navires', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadShips();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadShips();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadShips();
    }

    onCreate(): void {
        this.shipEvent.emit({ type: 'create' });
    }

    onView(ship: Ship): void {
        this.shipEvent.emit({ type: 'view', ship });
    }

    onEdit(ship: Ship): void {
        this.shipEvent.emit({ type: 'edit', ship });
    }

    onDelete(ship: Ship): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le navire "${ship.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteShip(ship);
            }
        });
    }

    onToggleStatus(ship: Ship): void {
        const action = ship.active ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} le navire "${ship.nom}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleShipStatus(ship);
            }
        });
    }

    private deleteShip(ship: Ship): void {
        this.shipService.deleteShip(ship.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Navire "${ship.nom}" supprimé avec succès`
                });
                this.loadShips();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleShipStatus(ship: Ship): void {
        this.shipService.toggleShipStatus(ship.id).subscribe({
            next: (updatedShip) => {
                const status = updatedShip.active ? 'activé' : 'désactivé';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Navire "${updatedShip.nom}" ${status} avec succès`
                });
                this.loadShips();
            },
            error: (error) => {
                this.logger.error('Erreur lors du changement de statut', error);
            }
        });
    }

    hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedCompany || this.selectedShipType ||
            this.selectedFlag || this.selectedStatus !== null);
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedCompany = null;
        this.selectedShipType = null;
        this.selectedFlag = null;
        this.selectedStatus = null;
        this.currentPage = 0;
        this.loadShips();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres effacés',
            detail: 'Tous les filtres ont été supprimés'
        });
    }

    getEmptyMessage(): string {
        if (this.hasActiveFilters()) {
            return 'Aucun navire ne correspond à vos critères de recherche.';
        }
        return 'Aucun navire n\'a été enregistré pour le moment.';
    }

    getCompanyName(compagnieId: number): string {
        return this.companiesMap.get(compagnieId) || 'Compagnie inconnue';
    }

    getTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'Conteneur': '#3b82f6',
            'Cargo': '#059669',
            'Pétrolier': '#dc2626',
            'Vraqueur': '#7c2d12',
            'Passagers': '#7c3aed',
            'Ro-Ro': '#ea580c',
            'Frigorifique': '#0891b2',
            'Chimiquier': '#be185d',
            'Gazier': '#4338ca',
            'Remorqueur': '#374151',
            'Pilote': '#1f2937'
        };
        return colors[type] || '#6b7280';
    }

    formatNumber(num: number): string {
        return new Intl.NumberFormat('fr-FR').format(num);
    }
}
