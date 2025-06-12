// pages/ships/components/ship-detail/ship-detail.component.ts - VERSION COMPLÈTE
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
    templateUrl: './ship-detail.component.html',
    styleUrls: ['./ship-detail.component.scss']
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

    onEdit(): void {
        if (this.ship) {
            this.editClick.emit(this.ship);
        }
    }

    onClose(): void {
        this.closeClick.emit();
    }
}
