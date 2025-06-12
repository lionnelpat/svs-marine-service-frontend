import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

import { DashboardService } from '../service/dashboard.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ChartData, DashboardStats, PieChartData } from '../../shared/models/dashboard.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        SkeletonModule,
        TagModule,
        ButtonModule,
        ProgressSpinnerModule,
        DividerModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Données du dashboard
    stats: DashboardStats | null = null;
    evolutionChart: ChartData | null = null;
    societesChart: PieChartData | null = null;
    prestationsChart: PieChartData | null = null;
    depensesChart: PieChartData | null = null;

    // États de chargement
    isLoadingStats = true;
    isLoadingCharts = true;

    // Options des graphiques
    lineChartOptions: any;
    pieChartOptions: any;
    barOptions: any;

    // Couleurs du thème
    private themeColors = {
        primary: '#1e40af',
        primaryLight: '#3b82f6',
        primaryDark: '#1e3a8a',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surfaceBorder: '#e2e8f0',
        textColor: '#1e293b',
        textSecondary: '#64748b'
    };

    constructor(private dashboardService: DashboardService) {
        this.initChartOptions();
    }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadDashboardData(): void {
        // Chargement des statistiques principales
        this.dashboardService.getDashboardStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = stats;
                    this.isLoadingStats = false;
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des statistiques:', error);
                    this.isLoadingStats = false;
                }
            });

        // Chargement parallèle de tous les graphiques
        forkJoin({
            evolution: this.dashboardService.getEvolutionChart(),
            societes: this.dashboardService.getRepartitionSocietesChart(),
            prestations: this.dashboardService.getRepartitionPrestationsChart(),
            depenses: this.dashboardService.getRepartitionDepensesChart()
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (charts) => {
                    this.processChartData(charts);
                    this.isLoadingCharts = false;
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des graphiques:', error);
                    this.isLoadingCharts = false;
                }
            });
    }

    private processChartData(charts: any): void {
        // Traitement des données pour les graphiques
        this.evolutionChart = this.applyLineChartStyle(charts.evolution);
        this.societesChart = this.applyPieChartStyle(charts.societes);
        this.prestationsChart = this.applyPieChartStyle(charts.prestations);
        this.depensesChart = this.applyPieChartStyle(charts.depenses);
    }

    private applyLineChartStyle(chartData: ChartData): ChartData {
        // Définition des styles spécifiques pour chaque dataset
        const datasetStyles = [
            { // Factures
                borderColor: this.themeColors.primary,
                backgroundColor: this.themeColors.primary + '33', // 20% d'opacité
                borderWidth: 3,
                pointStyle: 'circle',
                pointRadius: 6,
                pointHoverRadius: 8
            },
            { // Dépenses
                borderColor: this.themeColors.secondary,
                backgroundColor: this.themeColors.secondary + '33', // 20% d'opacité
                borderWidth: 3,
                borderDash: [5, 5],
                pointStyle: 'rect',
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ];

        return {
            ...chartData,
            datasets: chartData.datasets.map((dataset, index) => ({
                ...dataset,
                ...datasetStyles[index % datasetStyles.length], // Applique le style correspondant
                tension: 0.4,
                fill: false,
                pointBorderColor: '#ffffff',
                pointHitRadius: 10
            }))
        };
    }

    private applyPieChartStyle(chartData: PieChartData): PieChartData {
        return {
            ...chartData,
            datasets: chartData.datasets.map(dataset => ({
                ...dataset,
                backgroundColor: this.getPieChartColors(dataset.data.length),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }))
        };
    }

    private getDatasetColor(index: number, isBorder: boolean): string {
        const colors = [
            this.themeColors.primary,
            this.themeColors.secondary,
            this.themeColors.success,
            this.themeColors.warning,
            this.themeColors.danger
        ];

        const opacity = isBorder ? '1)' : '0.2)';
        return colors[index % colors.length] + opacity.replace('#', '');
    }

    private getPieChartColors(count: number): string[] {
        const baseColors = [
            this.themeColors.primary,
            this.themeColors.primaryLight,
            this.themeColors.primaryDark,
            this.themeColors.secondary,
            this.themeColors.success,
            this.themeColors.warning,
            this.themeColors.danger
        ];

        // Générer des nuances si plus de couleurs sont nécessaires
        if (count > baseColors.length) {
            const additionalColors = [];
            for (let i = 0; i < count - baseColors.length; i++) {
                additionalColors.push(this.shadeColor(baseColors[i % baseColors.length], (i + 1) * 10));
            }
            return [...baseColors, ...additionalColors];
        }

        return baseColors.slice(0, count);
    }

    private shadeColor(color: string, percent: number): string {
        // Fonction pour générer des nuances de couleur
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt((R * (100 + percent) / 100).toString());
        G = parseInt((G * (100 + percent) / 100).toString());
        B = parseInt((B * (100 + percent) / 100).toString());

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    private initChartOptions(): void {
        // Options communes
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: this.themeColors.textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: this.themeColors.textColor,
                    bodyColor: this.themeColors.textSecondary,
                    borderColor: this.themeColors.surfaceBorder,
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    cornerRadius: 8,
                    displayColors: true,
                    usePointStyle: true,
                    callbacks: {
                        labelColor: (context: any) => ({
                            borderColor: this.getDatasetColor(context.datasetIndex, true),
                            backgroundColor: this.getDatasetColor(context.datasetIndex, true),
                            borderRadius: 4
                        })
                    }
                }
            }
        };

        // Options pour le graphique linéaire
        this.lineChartOptions = {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    ...commonOptions.plugins.legend,
                    labels: {
                        ...commonOptions.plugins.legend.labels,
                        generateLabels: (chart: any) => {
                            const datasets = chart.data.datasets;
                            return datasets.map((dataset: any, i: number) => ({
                                text: dataset.label,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                pointStyle: dataset.pointStyle,
                                hidden: !chart.isDatasetVisible(i),
                                index: i
                            }));
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: this.themeColors.textSecondary,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: this.themeColors.surfaceBorder,
                        drawBorder: false,
                        borderDash: [4, 4]
                    },
                    ticks: {
                        color: this.themeColors.textSecondary,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        };

        // Options pour les graphiques en secteurs
        this.pieChartOptions = {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                tooltip: {
                    ...commonOptions.plugins.tooltip,
                    callbacks: {
                        ...commonOptions.plugins.tooltip.callbacks,
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = this.formatCurrency(context.raw);
                            const percentage = (context.raw / context.dataset.data.reduce((a: number, b: number) => a + b, 0) * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%',
            radius: '80%'
        };

        // Options pour les barres
        this.barOptions = {
            ...commonOptions,
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: this.themeColors.textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                y: {
                    grid: {
                        color: this.themeColors.surfaceBorder,
                        drawBorder: false,
                        borderDash: [4, 4]
                    },
                    ticks: {
                        color: this.themeColors.textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            barPercentage: 0.8,
            categoryPercentage: 0.8
        };
    }

    formatCurrency(amount: number): string {
        return this.dashboardService.formatCurrency(amount);
    }

    refreshDashboard(): void {
        this.isLoadingStats = true;
        this.isLoadingCharts = true;
        this.stats = null;
        this.evolutionChart = null;
        this.societesChart = null;
        this.prestationsChart = null;
        this.depensesChart = null;

        this.loadDashboardData();
    }

    // Méthodes utilitaires pour le formatage
    formatNumber(num: number): string {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    calculatePercentage(value: number, total: number): number {
        return Math.round((value / total) * 100);
    }

    getSeverityClass(type: 'revenue' | 'expense'): string {
        return type === 'revenue' ? 'success' : 'danger';
    }

    getIconClass(type: 'factures' | 'depenses' | 'montant-factures' | 'montant-depenses'): string {
        const iconMap = {
            'factures': 'pi pi-file-o',
            'depenses': 'pi pi-shopping-cart',
            'montant-factures': 'pi pi-dollar',
            'montant-depenses': 'pi pi-credit-card'
        };
        return iconMap[type];
    }
}
