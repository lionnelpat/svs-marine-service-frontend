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
    dateFacture: string;
    dateEcheance: string;
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

/**
 * Interface pour la réponse paginée des factures
 * Utilisée par l'API pour retourner une liste paginée
 */
export interface InvoicePageResponse {
    /** Liste des factures de la page courante */
    invoices: Invoice[];

    /** Nombre total d'éléments dans la base */
    total: number;

    /** Numéro de page courante (commence à 0) */
    page: number;

    /** Taille de la page (nombre d'éléments par page) */
    size: number;

    /** Nombre total de pages */
    totalPages: number;

    /** Indique si c'est la première page */
    first: boolean;

    /** Indique si c'est la dernière page */
    last: boolean;

    /** Indique s'il y a une page suivante */
    hasNext: boolean;

    /** Indique s'il y a une page précédente */
    hasPrevious: boolean;
}

/**
 * Interface pour les filtres de recherche des factures
 * Utilisée pour construire les requêtes de filtrage
 */
export interface InvoiceSearchFilter {
    /** Recherche textuelle (numéro, compagnie, navire, notes) */
    search?: string;

    /** Filtre par ID de compagnie maritime */
    compagnieId?: number;

    /** Filtre par ID de navire */
    navireId?: number;

    /** Filtre par statut de la facture */
    statut?: InvoiceStatus;

    /** Date de début de la période de facturation */
    dateDebut?: Date;

    /** Date de fin de la période de facturation */
    dateFin?: Date;

    /** Filtre par mois spécifique (1-12) */
    mois?: number;

    /** Filtre par année spécifique */
    annee?: number;

    /** Montant minimum de la facture */
    minAmount?: number;

    /** Montant maximum de la facture */
    maxAmount?: number;

    /** Filtre par statut actif/inactif */
    active?: boolean;

    /** Numéro de page (commence à 0) */
    page?: number;

    /** Taille de la page (défaut: 20) */
    size?: number;

    /** Champ de tri (défaut: 'dateFacture') */
    sortBy?: string;

    /** Direction du tri: 'asc' ou 'desc' (défaut: 'desc') */
    sortDirection?: 'asc' | 'desc';
}

/**
 * Interface pour les filtres simplifiés de liste
 * Utilisée dans les composants de liste pour une utilisation plus simple
 */
export interface InvoiceListFilter {
    /** Recherche textuelle globale */
    search?: string;

    /** Filtre par compagnie */
    compagnieId?: number;

    /** Filtre par navire */
    navireId?: number;

    /** Filtre par statut */
    statut?: InvoiceStatus;

    /** Date de début */
    dateDebut?: Date;

    /** Date de fin */
    dateFin?: Date;

    /** Mois (1-12) */
    mois?: number;

    /** Année */
    annee?: number;

    /** Statut actif */
    active?: boolean;

    /** Page courante */
    page?: number;

    /** Taille de page */
    size?: number;
}

/**
 * Interface pour la réponse de liste simplifiée
 * Utilisée dans les composants pour l'affichage
 */
export interface InvoiceListResponse {
    /** Liste des factures */
    invoices: Invoice[];

    /** Total des éléments */
    total: number;

    /** Page courante */
    page: number;

    /** Taille de page */
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
