// src/app/shared/models/expense.model.ts

import { Company } from './company.model';
import { ExpenseCategory } from './expense-category.model';

export interface Expense {
    id: number;
    numero: string;
    titre: string;
    description: string;
    categorieId: number;
    categorie?: ExpenseCategory;
    fournisseurId?: number;
    fournisseur?: ExpenseSupplier;
    dateDepense: Date;
    montantXOF: number;
    montantEURO?: number;
    tauxChange?: number;
    devise: Currency;
    modePaiement: PaymentMethod;
    statut: ExpenseStatus;
    created_at: Date;
    updated_at: Date;
}

export interface ExpenseSupplier {
    id: number;
    nom: string;
    raisonSociale?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

export interface ExpenseDocument {
    id: number;
    nom: string;
    type: DocumentType;
    url: string;
    taille: number;
    uploaded_at: Date;
}

export interface CreateExpenseRequest {
    titre: string;
    description: string;
    categorieId: number;
    fournisseurId?: number;
    dateDepense: Date;
    montantXOF: number;
    montantEURO?: number;
    modePaiement: PaymentMethod;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
    id: number;
}

export interface ExpenseListFilter {
    search?: string;
    categorieId?: number;
    fournisseurId?: number;
    statut?: ExpenseStatus;
    modePaiement?: PaymentMethod;
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

export interface ExpenseStatistics {
    totalDepenses: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
    depensesEnAttente: number;
    depensesApprouvees: number;
    depensesRejetees: number;
    depensesRemboursables: number;
    depensesRemboursees: number;
    depensesParCategorie: CategoryExpenseStats[];
    depensesParMois: MonthlyExpenseStats[];
    topFournisseurs: SupplierExpenseStats[];
}

export interface CategoryExpenseStats {
    categorieId: number;
    categorieNom: string;
    nombreDepenses: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
    pourcentage: number;
}

export interface MonthlyExpenseStats {
    mois: number;
    annee: number;
    nombreDepenses: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
}

export interface SupplierExpenseStats {
    fournisseurId: number;
    fournisseurNom: string;
    nombreDepenses: number;
    montantTotalXOF: number;
    montantTotalEURO: number;
}

export interface ExpenseExportData {
    numero: string;
    titre: string;
    categorie: string;
    fournisseur: string;
    dateDepense: string;
    montantXOF: number;
    montantEURO: number;
    modePaiement: string;
    statut: string;
}

export interface ExpenseCategoryListEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    expenseCategory?: ExpenseCategory;
}

export enum ExpenseStatus {
    EN_ATTENTE = 'EN_ATTENTE',
    APPROUVEE = 'APPROUVEE',
    REJETEE = 'REJETEE',
    PAYEE = 'PAYEE'
}

export enum PaymentMethod {
    ESPECES = 'ESPECES',
    CHEQUE = 'CHEQUE',
    VIREMENT = 'VIREMENT',
    CARTE_BANCAIRE = 'CARTE_BANCAIRE',
    MOBILE_MONEY = 'MOBILE_MONEY',
    AUTRE = 'AUTRE'
}

export enum Currency {
    XOF = 'XOF',
    EUR = 'EUR',
}

export enum DocumentType {
    FACTURE = 'FACTURE',
    RECU = 'RECU',
    BON_COMMANDE = 'BON_COMMANDE',
    AUTRE = 'AUTRE'
}

export const EXPENSE_STATUS_LABELS = {
    [ExpenseStatus.EN_ATTENTE]: 'En attente',
    [ExpenseStatus.APPROUVEE]: 'Approuvée',
    [ExpenseStatus.REJETEE]: 'Rejetée',
    [ExpenseStatus.PAYEE]: 'Payée'
};

export const EXPENSE_STATUS_SEVERITIES = {
    [ExpenseStatus.EN_ATTENTE]: 'warning',
    [ExpenseStatus.APPROUVEE]: 'success',
    [ExpenseStatus.REJETEE]: 'danger',
    [ExpenseStatus.PAYEE]: 'info'
};

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
    [Currency.EUR]: 'Euro (EUR)',
};

export const DOCUMENT_TYPE_LABELS = {
    [DocumentType.FACTURE]: 'Facture',
    [DocumentType.RECU]: 'Reçu',
    [DocumentType.BON_COMMANDE]: 'Bon de commande',
    [DocumentType.AUTRE]: 'Autre'
};
