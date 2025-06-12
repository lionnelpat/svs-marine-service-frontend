// pages/ships/components/ship-list/ship-list.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { Ship, SHIP_FLAGS, SHIP_TYPES, ShipListFilter } from '../../../../shared/models/ship.model';
import { ShipService } from '../../../service/ship.service';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

export interface ShipListEvent {
    type: 'edit' | 'view' | 'delete';
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
    templateUrl: './ship-list.component.html',
    styleUrls: ['./ship-list.component.scss']
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
