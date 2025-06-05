// shared/models/invoice.model.ts
import { Company } from './company.model';
import { Ship } from './ship.model';
import { Operation } from './operation.model';

export interface Invoice {
    id: number;
    numero: string;
    compagnieId: number;
    compagnie?: Company;
    navireId: number;
    navire?: Ship;
    dateFacture: Date;
    dateEcheance: Date;
    prestations: InvoiceLineItem[];
    sousTotal: number;
    tva: number;
    tauxTva: number;
    montantTotal: number;
    statut: InvoiceStatus;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    active: boolean;
}

export interface InvoiceLineItem {
    id: number;
    operationId: number;
    operation?: Operation;
    description: string;
    quantite: number;
    prixUnitaireXOF: number;
    prixUnitaireEURO?: number;
    montantXOF: number;
    montantEURO?: number;
}

export interface CreateInvoiceRequest {
    compagnieId: number;
    navireId: number;
    dateFacture: Date;
    dateEcheance: Date;
    prestations: CreateInvoiceLineItemRequest[];
    tauxTva: number;
    notes?: string;
}

export interface CreateInvoiceLineItemRequest {
    operationId: number;
    description: string;
    quantite: number;
    prixUnitaireXOF: number;
    prixUnitaireEURO?: number;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
    id: number;
}

export interface InvoiceListFilter {
    search?: string;
    compagnieId?: number;
    navireId?: number;
    statut?: InvoiceStatus;
    dateDebut?: Date;
    dateFin?: Date;
    mois?: number;
    annee?: number;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface InvoiceListResponse {
    invoices: Invoice[];
    total: number;
    page: number;
    size: number;
}

export interface InvoiceStatistics {
    totalFactures: number;
    totalMontantXOF: number;
    totalMontantEURO: number;
    facturesEnAttente: number;
    facturesPayees: number;
    facturesEnRetard: number;
    facturesParMois: MonthlyInvoiceStats[];
    topCompagnies: CompanyInvoiceStats[];
}

export interface MonthlyInvoiceStats {
    mois: number;
    annee: number;
    nombreFactures: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
}

export interface CompanyInvoiceStats {
    compagnieId: number;
    compagnieNom: string;
    nombreFactures: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
}

export interface InvoicePrintData {
    invoice: Invoice;
    entreprise: {
        nom: string;
        adresse: string;
        telephone: string;
        email: string;
        ninea: string;
        rccm: string;
        logo?: string;
    };
}

export enum InvoiceStatus {
    BROUILLON = 'BROUILLON',
    EMISE = 'EMISE',
    PAYEE = 'PAYEE',
    ANNULEE = 'ANNULEE',
    EN_RETARD = 'EN_RETARD'
}

export const INVOICE_STATUS_LABELS = {
    [InvoiceStatus.BROUILLON]: 'Brouillon',
    [InvoiceStatus.EMISE]: 'Émise',
    [InvoiceStatus.PAYEE]: 'Payée',
    [InvoiceStatus.ANNULEE]: 'Annulée',
    [InvoiceStatus.EN_RETARD]: 'En retard'
};

export const INVOICE_STATUS_SEVERITIES = {
    [InvoiceStatus.BROUILLON]: 'info',
    [InvoiceStatus.EMISE]: 'warning',
    [InvoiceStatus.PAYEE]: 'success',
    [InvoiceStatus.ANNULEE]: 'danger',
    [InvoiceStatus.EN_RETARD]: 'danger'
};

export const TVA_RATES = [
    { label: '0%', value: 0 },
    { label: '18%', value: 18 },
    { label: '20%', value: 20 }
];

// Enum pour les devises
export enum Currency {
    XOF = 'XOF',
    EUR = 'EUR'
}

// Interface pour l'export Excel
export interface InvoiceExportData {
    numero: string;
    compagnie: string;
    navire: string;
    dateFacture: string;
    montantXOF: number;
    montantEURO: number;
    statut: string;
    dateEcheance: string;
}
