// pages/ships/components/ship-detail/ship-detail.component.ts - VERSION COMPLÈTE
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { Ship } from '../../../../shared/models/ship.model';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
    selector: 'app-ship-detail',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TagModule,
        DividerModule,
        AvatarModule,
        ChipModule,
        ProgressBarModule,
        BadgeModule
    ],
    template: `
    <div class="ship-detail" *ngIf="ship">
      <!-- En-tête avec nom et statut -->
      <div class="ship-header">
        <div class="flex align-items-center gap-3">
          <p-avatar
            icon="pi pi-send"
            size="large"
            shape="circle"
            [style]="{'background-color': getTypeColor(ship.typeNavire), 'color': 'white'}"
          ></p-avatar>
          <div>
            <h3 class="ship-name">{{ ship.nom }}</h3>
            <div class="ship-info">
              <p-chip
                [label]="ship.typeNavire"
                [style]="{'background-color': getTypeColor(ship.typeNavire), 'color': 'white'}"
              ></p-chip>
              <p-chip
                [label]="ship.pavillon"
                styleClass="flag-chip ml-2"
              ></p-chip>
            </div>
          </div>
        </div>
        <div class="ship-status">
          <p-tag
            [value]="ship.active ? 'Actif' : 'Inactif'"
            [severity]="ship.active ? 'success' : 'danger'"
            [rounded]="true"
          ></p-tag>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Identification -->
      <div class="detail-section">
        <h4 class="section-title">
          <i class="pi pi-id-card mr-2"></i>
          Identification
        </h4>
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="detail-field">
              <label class="field-label">Numéro IMO</label>
              <div class="field-value imo-value">{{ ship.numeroIMO }}</div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="detail-field">
              <label class="field-label">Numéro MMSI</label>
              <div class="field-value mmsi-value">{{ ship.numeroMMSI }}</div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="detail-field">
              <label class="field-label">Indicatif d'appel</label>
              <div class="field-value call-sign-value">{{ ship.numeroAppel }}</div>
            </div>
          </div>
        </div>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Port d'attache</label>
              <div class="field-value">
                <i class="pi pi-map-marker mr-2"></i>
                {{ ship.portAttache }}
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Compagnie propriétaire</label>
              <div class="field-value company-value">
                <i class="pi pi-building mr-2"></i>
                {{ companyName || 'Chargement...' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Dimensions et caractéristiques -->
      <div class="detail-section">
        <h4 class="section-title">
          <i class="pi pi-ruler mr-2"></i>
          Dimensions et caractéristiques
        </h4>

        <!-- Dimensions principales -->
        <div class="dimensions-grid">
          <div class="dimension-card">
            <div class="dimension-header">
              <i class="pi pi-arrows-h"></i>
              <span>Longueur</span>
            </div>
            <div class="dimension-value">{{ ship.longueur }} m</div>
          </div>
          <div class="dimension-card">
            <div class="dimension-header">
              <i class="pi pi-arrows-v"></i>
              <span>Largeur</span>
            </div>
            <div class="dimension-value">{{ ship.largeur }} m</div>
          </div>
          <div class="dimension-card">
            <div class="dimension-header">
              <i class="pi pi-sort-down"></i>
              <span>Tirant d'eau</span>
            </div>
            <div class="dimension-value">{{ ship.tirantEau }} m</div>
          </div>
        </div>

        <!-- Tonnages -->
        <div class="tonnage-section mt-4">
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="tonnage-card">
                <div class="tonnage-header">
                  <span class="tonnage-label">Tonnage Brut</span>
                </div>
                <div class="tonnage-value">{{ formatNumber(ship.tonnageBrut) }}</div>
                <div class="tonnage-bar">
                  <p-progressBar [value]="100" [showValue]="false" styleClass="tonnage-progress"></p-progressBar>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="tonnage-card">
                <div class="tonnage-header">
                  <span class="tonnage-label">Tonnage Net</span>
                </div>
                <div class="tonnage-value">{{ formatNumber(ship.tonnageNet) }}</div>
                <div class="tonnage-bar">
                  <p-progressBar
                    [value]="getTonnageRatio()"
                    [showValue]="false"
                    styleClass="tonnage-progress-net"
                  ></p-progressBar>
                </div>
                <small class="tonnage-ratio">{{ getTonnageRatio() }}% du tonnage brut</small>
              </div>
            </div>
            <div class="col-12 md:col-4" *ngIf="ship.nombrePassagers">
              <div class="tonnage-card">
                <div class="tonnage-header">
                  <span class="tonnage-label">Passagers</span>
                </div>
                <div class="tonnage-value">{{ formatNumber(ship.nombrePassagers) }}</div>
                <div class="tonnage-bar">
                  <p-progressBar [value]="75" [showValue]="false" styleClass="passenger-progress"></p-progressBar>
                </div>
                <small class="tonnage-ratio">Capacité maximale</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Ratios et calculs -->
        <div class="metrics-section mt-4">
          <div class="grid">
            <div class="col-12 md:col-3">
              <div class="metric-item">
                <div class="metric-label">Ratio L/l</div>
                <div class="metric-value">{{ getRatio(ship.longueur, ship.largeur) }}</div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="metric-item">
                <div class="metric-label">Surface pont</div>
                <div class="metric-value">{{ formatNumber(ship.longueur * ship.largeur) }} m²</div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="metric-item">
                <div class="metric-label">Volume approx.</div>
                <div class="metric-value">{{ formatNumber(ship.longueur * ship.largeur * ship.tirantEau) }} m³</div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="metric-item">
                <div class="metric-label">Âge</div>
                <div class="metric-value">{{ getShipAge() }} ans</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Construction et classification -->
      <div class="detail-section">
        <h4 class="section-title">
          <i class="pi pi-wrench mr-2"></i>
          Construction et classification
        </h4>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Année de construction</label>
              <div class="field-value">
                <i class="pi pi-calendar mr-2"></i>
                {{ ship.anneConstruction }}
                <p-badge
                  [value]="getShipAge() + ' ans'"
                  [severity]="getAgeSeverity()"
                  class="ml-2"
                ></p-badge>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Société de classification</label>
              <div class="field-value">
                <i class="pi pi-verified mr-2"></i>
                {{ ship.classification }}
              </div>
            </div>
          </div>
        </div>
        <div class="grid">
          <div class="col-12">
            <div class="detail-field">
              <label class="field-label">Chantier de construction</label>
              <div class="field-value">
                <i class="pi pi-cog mr-2"></i>
                {{ ship.chantierConstruction }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Informations techniques avancées -->
      <div class="detail-section">
        <h4 class="section-title">
          <i class="pi pi-chart-line mr-2"></i>
          Performances et capacités
        </h4>

        <div class="performance-grid">
          <div class="performance-card">
            <div class="performance-icon">
              <i class="pi pi-gauge"></i>
            </div>
            <div class="performance-info">
              <div class="performance-label">Vitesse estimée</div>
              <div class="performance-value">{{ getEstimatedSpeed() }} nœuds</div>
              <small class="performance-note">Basé sur les dimensions</small>
            </div>
          </div>

          <div class="performance-card">
            <div class="performance-icon">
              <i class="pi pi-database"></i>
            </div>
            <div class="performance-info">
              <div class="performance-label">Capacité cargo</div>
              <div class="performance-value">{{ getCargoCapacity() }}</div>
              <small class="performance-note">Estimation basée sur le type</small>
            </div>
          </div>

          <div class="performance-card">
            <div class="performance-icon">
              <i class="pi pi-shield"></i>
            </div>
            <div class="performance-info">
              <div class="performance-label">Classe d'âge</div>
              <div class="performance-value">{{ getAgeClass() }}</div>
              <small class="performance-note">{{ getShipAge() }} ans</small>
            </div>
          </div>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Métadonnées -->
      <div class="detail-section">
        <h4 class="section-title">
          <i class="pi pi-info-circle mr-2"></i>
          Informations système
        </h4>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Date de création</label>
              <div class="field-value">
                <i class="pi pi-plus-circle mr-2"></i>
                {{ formatDate(ship.created_at) }}
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="detail-field">
              <label class="field-label">Dernière modification</label>
              <div class="field-value">
                <i class="pi pi-pencil mr-2"></i>
                {{ formatDate(ship.updated_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="detail-actions">
        <button
          pButton
          type="button"
          label="Modifier"
          icon="pi pi-pencil"
          class="p-button-raised"
          (click)="onEdit()"
          style="background-color: var(--svs-accent); border-color: var(--svs-accent)"
        ></button>
        <button
          pButton
          type="button"
          label="Fermer"
          icon="pi pi-times"
          class="p-button-text ml-2"
          (click)="onClose()"
        ></button>
      </div>
    </div>
  `,
    styles: [`
    .ship-detail {
      .ship-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;

        .ship-name {
          margin: 0;
          color: var(--svs-primary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .ship-info {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }

      .detail-section {
        margin-bottom: 2rem;

        .section-title {
          color: var(--svs-primary);
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }
      }

      .detail-field {
        margin-bottom: 1rem;

        .field-label {
          display: block;
          font-weight: 500;
          color: var(--svs-text);
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .field-value {
          color: var(--svs-text);
          font-size: 1rem;
          display: flex;
          align-items: center;

          &.imo-value,
          &.mmsi-value,
          &.call-sign-value {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: var(--svs-primary);
            font-size: 1.1rem;
          }

          &.company-value {
            color: var(--svs-accent);
            font-weight: 500;
          }
        }
      }

      .dimensions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;

        .dimension-card {
          background: var(--svs-surface);
          border: 1px solid var(--svs-surface-dark);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: transform 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .dimension-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: var(--svs-text);
            opacity: 0.8;
            font-size: 0.9rem;
          }

          .dimension-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--svs-primary);
          }
        }
      }

      .tonnage-section {
        .tonnage-card {
          background: var(--svs-surface);
          border: 1px solid var(--svs-surface-dark);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;

          .tonnage-header {
            margin-bottom: 0.5rem;

            .tonnage-label {
              font-size: 0.9rem;
              color: var(--svs-text);
              opacity: 0.8;
            }
          }

          .tonnage-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--svs-accent);
            margin-bottom: 0.5rem;
          }

          .tonnage-bar {
            margin: 0.5rem 0;
          }

          .tonnage-ratio {
            color: var(--svs-text);
            opacity: 0.7;
            font-size: 0.8rem;
          }
        }
      }

      .metrics-section {
        background: var(--svs-surface-dark);
        border-radius: 8px;
        padding: 1rem;

        .metric-item {
          text-align: center;

          .metric-label {
            font-size: 0.85rem;
            color: var(--svs-text);
            opacity: 0.8;
            margin-bottom: 0.25rem;
          }

          .metric-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--svs-primary);
          }
        }
      }

      .performance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;

        .performance-card {
          background: var(--svs-surface);
          border: 1px solid var(--svs-surface-dark);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;

          .performance-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--svs-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
          }

          .performance-info {
            flex: 1;

            .performance-label {
              font-size: 0.9rem;
              color: var(--svs-text);
              opacity: 0.8;
              margin-bottom: 0.25rem;
            }

            .performance-value {
              font-size: 1.1rem;
              font-weight: 600;
              color: var(--svs-accent);
              margin-bottom: 0.25rem;
            }

            .performance-note {
              font-size: 0.75rem;
              color: var(--svs-text);
              opacity: 0.6;
            }
          }
        }
      }

      .detail-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--svs-surface-dark);
      }

      ::ng-deep {
        .p-chip {
          font-size: 0.75rem;

          &.flag-chip {
            background-color: var(--svs-surface-dark);
            color: var(--svs-text);
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

        .tonnage-progress .p-progressbar-value {
          background-color: var(--svs-primary);
        }

        .tonnage-progress-net .p-progressbar-value {
          background-color: var(--svs-accent);
        }

        .passenger-progress .p-progressbar-value {
          background-color: #7c3aed;
        }

        .p-badge {
          &.p-badge-success {
            background-color: #10b981;
          }

          &.p-badge-warning {
            background-color: #f59e0b;
          }

          &.p-badge-danger {
            background-color: #ef4444;
          }
        }
      }
    }
  `]
})
export class ShipDetailComponent implements OnInit, OnChanges {
    @Input() ship: Ship | null = null;
    @Output() editClick = new EventEmitter<Ship>();
    @Output() closeClick = new EventEmitter<void>();

    companyName = '';

    constructor(
        private companyService: CompanyService,
        private logger: LoggerService
    ) {}

    ngOnInit(): void {
        if (this.ship) {
            this.loadCompanyName();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['ship'] && this.ship) {
            this.loadCompanyName();
        }
    }

    private loadCompanyName(): void {
        if (this.ship) {
            this.companyService.getCompanyById(this.ship.compagnieId).subscribe({
                next: (company) => {
                    this.companyName = company.nom;
                },
                error: (error) => {
                    this.companyName = 'Compagnie inconnue';
                    this.logger.error('Erreur lors du chargement de la compagnie', error);
                }
            });
        }
    }

    formatDate(date: Date): string {
        if (!date) return '';

        const dateObj = new Date(date);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }

    formatNumber(num: number): string {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    getShipAge(): number {
        if (!this.ship) return 0;
        return new Date().getFullYear() - this.ship.anneConstruction;
    }

    getTonnageRatio(): number {
        if (!this.ship) return 0;
        return Math.round((this.ship.tonnageNet / this.ship.tonnageBrut) * 100);
    }

    getRatio(a: number, b: number): string {
        if (!a || !b) return '-';
        return (a / b).toFixed(2);
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

    getAgeSeverity(): string {
        const age = this.getShipAge();
        if (age < 10) return 'success';
        if (age < 20) return 'warning';
        return 'danger';
    }

    getEstimatedSpeed(): string {
        if (!this.ship) return '-';

        // Estimation basée sur le type et les dimensions
        const speedByType: { [key: string]: number } = {
            'Conteneur': 22,
            'Cargo': 18,
            'Pétrolier': 16,
            'Vraqueur': 14,
            'Passagers': 25,
            'Ro-Ro': 20,
            'Frigorifique': 19,
            'Chimiquier': 15,
            'Gazier': 17,
            'Remorqueur': 12,
            'Pilote': 15
        };

        const baseSpeed = speedByType[this.ship.typeNavire] || 16;
        return `${baseSpeed - 2}-${baseSpeed}`;
    }

    getCargoCapacity(): string {
        if (!this.ship) return '-';

        switch (this.ship.typeNavire) {
            case 'Conteneur':
                const teu = Math.round(this.ship.tonnageBrut / 14);
                return `~${this.formatNumber(teu)} TEU`;
            case 'Pétrolier':
            case 'Chimiquier':
                const dwt = Math.round(this.ship.tonnageBrut * 1.8);
                return `~${this.formatNumber(dwt)} DWT`;
            case 'Vraqueur':
                const bulk = Math.round(this.ship.tonnageBrut * 1.6);
                return `~${this.formatNumber(bulk)} DWT`;
            case 'Passagers':
            case 'Ro-Ro':
                return this.ship.nombrePassagers ?
                    `${this.formatNumber(this.ship.nombrePassagers)} PAX` :
                    'Non spécifié';
            default:
                return `${this.formatNumber(this.ship.tonnageNet)} t`;
        }
    }

    getAgeClass(): string {
        const age = this.getShipAge();
        if (age < 5) return 'Neuf';
        if (age < 10) return 'Récent';
        if (age < 15) return 'Moderne';
        if (age < 25) return 'Mature';
        return 'Ancien';
    }

    onEdit(): void {
        if (this.ship) {
            this.editClick.emit(this.ship);
        }
    }

    onClose(): void {
        this.closeClick.emit();
    }
}
