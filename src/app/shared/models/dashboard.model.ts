export interface DashboardStats {
    totalFactures: number;
    montantTotalFactures: number;
    totalDepenses: number;
    montantTotalDepenses: number;
}

export interface ChartData {
    labels: string[];
    datasets: any[];
}

export interface PieChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverBackgroundColor: string[];
    }[];
}

export interface EvolutionData {
    mois: string;
    factures: number;
    depenses: number;
}
