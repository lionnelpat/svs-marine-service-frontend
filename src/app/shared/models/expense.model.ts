

// Interface principale Expense (mise à jour pour correspondre à l'API)
export interface Expense {
    id: number;
    numero: string;
    titre: string;
    description: string;
    categorieId: number;
    categorieNom?: string;
    fournisseurId?: number;
    fournisseurNom?: string;
    dateDepense: Date;
    montantXOF: number;
    montantEURO?: number;
    tauxChange?: number;
    devise: Currency;
    paymentMethodId: number;
    paymentMethodNom?: string;
    statut: ExpenseStatus;
    statutLabel?: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

// DTOs pour correspondre au backend
export interface ExpenseCreateRequest {
    numero?: string;
    titre: string;
    description?: string;
    categorieId: number;
    fournisseurId?: number;
    dateDepense: string;
    montantXOF: number;
    montantEURO?: number;
    tauxChange?: number;
    devise: Currency;
    paymentMethodId: number;
    statut?: ExpenseStatus;
}

export interface ExpenseUpdateRequest {
    numero?: string;
    titre?: string;
    description?: string;
    categorieId?: number;
    fournisseurId?: number;
    dateDepense?: string;
    montantXOF?: number;
    montantEURO?: number;
    tauxChange?: number;
    devise?: Currency;
    paymentMethodId?: number;
    statut?: ExpenseStatus;
    active?: boolean;
}

export interface ExpenseSearchFilter {
    search?: string;
    categorieId?: number;
    fournisseurId?: number;
    statut?: ExpenseStatus;
    paymentMethodId?: number;
    devise?: Currency;
    minAmount?: number;
    maxAmount?: number;
    startDate?: Date;
    endDate?: Date;
    year?: number;
    month?: number;
    day?: number;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface ExpensePageResponse {
    expenses: Expense[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface ExpenseStatusChangeRequest {
    statut: ExpenseStatus;
    commentaire?: string;
}

export interface ExpenseStatsResponse {
    totalExpenses: number;
    totalAmountXOF: number;
    totalAmountEUR: number;
    statutRepartition: StatutCount[];
    categorieRepartition: CategorieCount[];
    evolutionMensuelle: MonthlyExpense[];
}

export interface StatutCount {
    statut: ExpenseStatus;
    label: string;
    count: number;
    totalAmount: number;
}

export interface CategorieCount {
    categorieId: number;
    categorieNom: string;
    count: number;
    totalAmount: number;
}

export interface MonthlyExpense {
    year: number;
    month: number;
    monthLabel: string;
    count: number;
    totalAmount: number;
}

// Interface pour les options de dropdown
export interface DropdownOption {
    label: string;
    value: any;
}

// Interface pour la gestion des filtres dans le composant
export interface ExpenseListFilter {
    search?: string;
    categorieId?: number;
    fournisseurId?: number;
    statut?: ExpenseStatus;
    paymentMethodId?: number;
    dateDebut?: Date;
    dateFin?: Date;
    mois?: number;
    annee?: number;
    montantMin?: number;
    montantMax?: number;
    page?: number;
    size?: number;
}

export interface ExpenseListResponse {
    expenses: Expense[];
    total: number;
    page: number;
    size: number;
}

// Interfaces existantes conservées
export interface ExpenseSupplier {
    id: number;
    nom: string;
    raisonSociale?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    active?: boolean;
}

export interface PaymentMethodOption {
    id: number;
    nom: string;
    code: string;
    description?: string;
    iconUrl?: string;
    actif: boolean;
    ordreAffichage?: number;
}

// Enums existants conservés
export enum ExpenseStatus {
    EN_ATTENTE = 'EN_ATTENTE',
    APPROUVEE = 'APPROUVEE',
    REJETEE = 'REJETEE',
    PAYEE = 'PAYEE'
}

export enum Currency {
    XOF = 'XOF',
    EUR = 'EUR'
}

export enum PaymentMethod {
    ESPECES = 'ESPECES',
    CHEQUE = 'CHEQUE',
    VIREMENT = 'VIREMENT',
    CARTE_BANCAIRE = 'CARTE_BANCAIRE',
    MOBILE_MONEY = 'MOBILE_MONEY',
    AUTRE = 'AUTRE'
}

export enum DocumentType {
    FACTURE = 'FACTURE',
    RECU = 'RECU',
    BON_COMMANDE = 'BON_COMMANDE',
    AUTRE = 'AUTRE'
}

// Labels et configurations existants conservés
export const EXPENSE_STATUS_LABELS = {
    [ExpenseStatus.EN_ATTENTE]: 'En attente',
    [ExpenseStatus.APPROUVEE]: 'Approuvée',
    [ExpenseStatus.REJETEE]: 'Rejetée',
    [ExpenseStatus.PAYEE]: 'Payée'
};

export const EXPENSE_STATUS_SEVERITIES = {
    [ExpenseStatus.EN_ATTENTE]: 'warn',
    [ExpenseStatus.APPROUVEE]: 'success',
    [ExpenseStatus.REJETEE]: 'danger',
    [ExpenseStatus.PAYEE]: 'info'
} as const;

export const PAYMENT_METHOD_LABELS = {
    [PaymentMethod.ESPECES]: 'Espèces',
    [PaymentMethod.CHEQUE]: 'Chèque',
    [PaymentMethod.VIREMENT]: 'Virement bancaire',
    [PaymentMethod.CARTE_BANCAIRE]: 'Carte bancaire',
    [PaymentMethod.MOBILE_MONEY]: 'Mobile Money',
    [PaymentMethod.AUTRE]: 'Autre'
};

export const CURRENCY_LABELS = {
    [Currency.XOF]: 'Franc CFA (XOF)',
    [Currency.EUR]: 'Euro (EUR)'
};

export const DOCUMENT_TYPE_LABELS = {
    [DocumentType.FACTURE]: 'Facture',
    [DocumentType.RECU]: 'Reçu',
    [DocumentType.BON_COMMANDE]: 'Bon de commande',
    [DocumentType.AUTRE]: 'Autre'
};
