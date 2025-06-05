import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ChartData, DashboardStats, PieChartData } from '../../shared/models/dashboard.model';



@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor() { }

    // Simulation des données du backend
    private fakeData = {
        stats: {
            totalFactures: 1247,
            montantTotalFactures: 125750000, // en FCFA
            totalDepenses: 856,
            montantTotalDepenses: 45230000 // en FCFA
        },
        evolutionMensuelle: [
            { mois: 'Jan 2024', factures: 85, depenses: 65 },
            { mois: 'Fév 2024', factures: 92, depenses: 78 },
            { mois: 'Mar 2024', factures: 78, depenses: 56 },
            { mois: 'Avr 2024', factures: 105, depenses: 89 },
            { mois: 'Mai 2024', factures: 118, depenses: 92 },
            { mois: 'Jun 2024', factures: 95, depenses: 73 },
            // { mois: 'Jul 2024', factures: 110, depenses: 88 },
            // { mois: 'Aoû 2024', factures: 102, depenses: 81 },
            // { mois: 'Sep 2024', factures: 125, depenses: 95 },
            // { mois: 'Oct 2024', factures: 138, depenses: 102 },
            // { mois: 'Nov 2024', factures: 142, depenses: 108 },
            // { mois: 'Déc 2024', factures: 157, depenses: 129 }
        ],
        repartitionSocietes: [
            { nom: 'COSEC Sénégal', montant: 35250000 },
            { nom: 'Port Autonome Dakar', montant: 28150000 },
            { nom: 'TRACTAFRIC Motors', montant: 22800000 },
            { nom: 'SONACOS', montant: 18950000 },
            { nom: 'SUNEOR', montant: 12750000 },
            { nom: 'Autres', montant: 7850000 }
        ],
        repartitionPrestations: [
            { nom: 'Transport Maritime', montant: 42750000 },
            { nom: 'Manutention Portuaire', montant: 28950000 },
            { nom: 'Logistique', montant: 22150000 },
            { nom: 'Entreposage', montant: 18400000 },
            { nom: 'Transit', montant: 13500000 }
        ],
        repartitionDepenses: [
            { nom: 'Carburant', montant: 15250000 },
            { nom: 'Maintenance', montant: 12750000 },
            { nom: 'Personnel', montant: 8950000 },
            { nom: 'Assurance', montant: 4280000 },
            { nom: 'Diverses', montant: 4000000 }
        ]
    };

    getDashboardStats(): Observable<DashboardStats> {
        return of(this.fakeData.stats).pipe(delay(500));
    }

    getEvolutionChart(): Observable<ChartData> {
        const evolutionData = {
            labels: this.fakeData.evolutionMensuelle.map(item => item.mois),
            datasets: [
                {
                    label: 'Factures',
                    data: this.fakeData.evolutionMensuelle.map(item => item.factures),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Dépenses',
                    data: this.fakeData.evolutionMensuelle.map(item => item.depenses),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        };
        return of(evolutionData).pipe(delay(300));
    }

    getRepartitionSocietesChart(): Observable<PieChartData> {
        const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const hoverColors = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

        const chartData = {
            labels: this.fakeData.repartitionSocietes.map(item => item.nom),
            datasets: [{
                data: this.fakeData.repartitionSocietes.map(item => item.montant),
                backgroundColor: colors,
                hoverBackgroundColor: hoverColors
            }]
        };
        return of(chartData).pipe(delay(400));
    }

    getRepartitionPrestationsChart(): Observable<PieChartData> {
        const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        const hoverColors = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'];

        const chartData = {
            labels: this.fakeData.repartitionPrestations.map(item => item.nom),
            datasets: [{
                data: this.fakeData.repartitionPrestations.map(item => item.montant),
                backgroundColor: colors,
                hoverBackgroundColor: hoverColors
            }]
        };
        return of(chartData).pipe(delay(450));
    }

    getRepartitionDepensesChart(): Observable<PieChartData> {
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
        const hoverColors = ['#dc2626', '#d97706', '#059669', '#0891b2', '#7c3aed'];

        const chartData = {
            labels: this.fakeData.repartitionDepenses.map(item => item.nom),
            datasets: [{
                data: this.fakeData.repartitionDepenses.map(item => item.montant),
                backgroundColor: colors,
                hoverBackgroundColor: hoverColors
            }]
        };
        return of(chartData).pipe(delay(500));
    }

    // Méthode utilitaire pour formater les montants en FCFA
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('XOF', 'FCFA');
    }
}
