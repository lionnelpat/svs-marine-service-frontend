

import {
    Expense,
    ExpenseSupplier,
    ExpenseStatus,
    PaymentMethod,
    Currency
} from '../models/expense.model';
import { ExpenseCategory } from '../models/expense-category.model';

// Catégories de dépenses simplifiées
export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
    {
        id: 1,
        nom: 'Carburant et Énergie',
        code: 'CARBURANT',
        description: 'Achats de carburant, électricité, gaz',
        icone: 'pi-bolt'
    },
    {
        id: 2,
        nom: 'Maintenance et Réparations',
        code: 'MAINTENANCE',
        description: 'Entretien équipements, réparations navires',
        icone: 'pi-wrench'
    },
    {
        id: 3,
        nom: 'Fournitures de Bureau',
        code: 'BUREAU',
        description: 'Papeterie, informatique, mobilier',
        icone: 'pi-desktop'
    },
    {
        id: 4,
        nom: 'Transport et Déplacement',
        code: 'TRANSPORT',
        description: 'Frais de transport, missions, hébergement',
        icone: 'pi-car'
    },
    {
        id: 5,
        nom: 'Services Extérieurs',
        code: 'SERVICES',
        description: 'Consultants, sous-traitance, prestations',
        icone: 'pi-users'
    },
    {
        id: 6,
        nom: 'Assurances',
        code: 'ASSURANCE',
        description: 'Assurances véhicules, équipements, responsabilité',
        icone: 'pi-shield'
    }
];

// Fournisseurs simplifiés
export const MOCK_EXPENSE_SUPPLIERS: ExpenseSupplier[] = [
    {
        id: 1,
        nom: 'Total Sénégal',
        raisonSociale: 'Total Marketing Sénégal SA',
        adresse: 'Avenue Bourguiba, Dakar',
        telephone: '+221 33 889 10 00',
        email: 'contact@total.sn'
    },
    {
        id: 2,
        nom: 'SENELEC',
        raisonSociale: 'Société Nationale d\'Électricité du Sénégal',
        adresse: 'Rue Vincent, Dakar',
        telephone: '+221 33 839 60 00',
        email: 'info@senelec.sn'
    },
    {
        id: 3,
        nom: 'Dakar Marine Services',
        raisonSociale: 'Dakar Marine Services SARL',
        adresse: 'Port de Dakar, Zone industrielle',
        telephone: '+221 33 842 15 30',
        email: 'contact@dakarmarine.sn'
    },
    {
        id: 4,
        nom: 'Orange Business',
        raisonSociale: 'Orange Sonatel SA',
        adresse: 'Place de l\'Indépendance, Dakar',
        telephone: '+221 33 859 90 00',
        email: 'business@orange.sn'
    },
    {
        id: 5,
        nom: 'Bureau Vallée Dakar',
        raisonSociale: 'Bureau Vallée Sénégal SARL',
        adresse: 'Almadies, Dakar',
        telephone: '+221 33 820 45 67',
        email: 'contact@bureauvallee.sn'
    }
];

// Dépenses de test adaptées aux interfaces simplifiées
export const MOCK_EXPENSES: Expense[] = [
    {
        id: 1,
        numero: 'DEP-2025-06-0001',
        titre: 'Achat carburant gazole',
        description: 'Approvisionnement en gazole pour les remorqueurs portuaires',
        categorieId: 1,
        categorie: MOCK_EXPENSE_CATEGORIES[0],
        fournisseurId: 1,
        fournisseur: MOCK_EXPENSE_SUPPLIERS[0],
        dateDepense: new Date('2025-06-01'),
        montantXOF: 2500000,
        montantEURO: 3810,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.VIREMENT,
        statut: ExpenseStatus.PAYEE,
        created_at: new Date('2025-06-01T08:30:00'),
        updated_at: new Date('2025-06-01T14:30:00')
    },
    {
        id: 2,
        numero: 'DEP-2025-06-0002',
        titre: 'Réparation grue portuaire',
        description: 'Maintenance préventive et réparation de la grue principale',
        categorieId: 2,
        categorie: MOCK_EXPENSE_CATEGORIES[1],
        fournisseurId: 3,
        fournisseur: MOCK_EXPENSE_SUPPLIERS[2],
        dateDepense: new Date('2025-06-02'),
        montantXOF: 1850000,
        montantEURO: 2820,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.CHEQUE,
        statut: ExpenseStatus.APPROUVEE,
        created_at: new Date('2025-06-02T09:45:00'),
        updated_at: new Date('2025-06-02T12:00:00')
    },
    {
        id: 3,
        numero: 'DEP-2025-06-0003',
        titre: 'Mission inspection Ziguinchor',
        description: 'Frais de mission pour inspection du quai de Ziguinchor',
        categorieId: 4,
        categorie: MOCK_EXPENSE_CATEGORIES[3],
        dateDepense: new Date('2025-06-03'),
        montantXOF: 450000,
        montantEURO: 686,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.ESPECES,
        statut: ExpenseStatus.EN_ATTENTE,
        created_at: new Date('2025-06-03T15:00:00'),
        updated_at: new Date('2025-06-03T16:30:00')
    },
    {
        id: 4,
        numero: 'DEP-2025-06-0004',
        titre: 'Abonnement internet bureau',
        description: 'Abonnement mensuel internet haut débit',
        categorieId: 3,
        categorie: MOCK_EXPENSE_CATEGORIES[2],
        fournisseurId: 4,
        fournisseur: MOCK_EXPENSE_SUPPLIERS[3],
        dateDepense: new Date('2025-06-01'),
        montantXOF: 185000,
        montantEURO: 282,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.VIREMENT,
        statut: ExpenseStatus.PAYEE,
        created_at: new Date('2025-05-30T13:30:00'),
        updated_at: new Date('2025-06-01T10:00:00')
    },
    {
        id: 5,
        numero: 'DEP-2025-05-0025',
        titre: 'Fournitures de bureau',
        description: 'Achat de fournitures pour le service administratif',
        categorieId: 3,
        categorie: MOCK_EXPENSE_CATEGORIES[2],
        fournisseurId: 5,
        fournisseur: MOCK_EXPENSE_SUPPLIERS[4],
        dateDepense: new Date('2025-05-28'),
        montantXOF: 125000,
        montantEURO: 190,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.CARTE_BANCAIRE,
        statut: ExpenseStatus.REJETEE,
        created_at: new Date('2025-05-28T13:45:00'),
        updated_at: new Date('2025-05-29T09:15:00')
    },
    {
        id: 6,
        numero: 'DEP-2025-06-0005',
        titre: 'Consultant juridique',
        description: 'Honoraires consultation juridique contrats portuaires',
        categorieId: 5,
        categorie: MOCK_EXPENSE_CATEGORIES[4],
        dateDepense: new Date('2025-06-04'),
        montantEURO: 2500,
        montantXOF: 1640000,
        tauxChange: 656,
        devise: Currency.EUR,
        modePaiement: PaymentMethod.VIREMENT,
        statut: ExpenseStatus.EN_ATTENTE,
        created_at: new Date('2025-06-04T16:00:00'),
        updated_at: new Date('2025-06-04T16:00:00')
    },
    {
        id: 7,
        numero: 'DEP-2025-06-0006',
        titre: 'Assurance véhicules',
        description: 'Prime annuelle assurance flotte véhicules portuaires',
        categorieId: 6,
        categorie: MOCK_EXPENSE_CATEGORIES[5],
        fournisseurId: 2,
        fournisseur: MOCK_EXPENSE_SUPPLIERS[1],
        dateDepense: new Date('2025-06-05'),
        montantXOF: 3200000,
        montantEURO: 4878,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.VIREMENT,
        statut: ExpenseStatus.APPROUVEE,
        created_at: new Date('2025-06-05T10:00:00'),
        updated_at: new Date('2025-06-05T14:00:00')
    },
    {
        id: 8,
        numero: 'DEP-2025-06-0007',
        titre: 'Équipement sécurité',
        description: 'Achat d\'équipements de protection individuelle pour les équipes',
        categorieId: 2,
        categorie: MOCK_EXPENSE_CATEGORIES[1],
        dateDepense: new Date('2025-06-06'),
        montantXOF: 675000,
        montantEURO: 1029,
        tauxChange: 656,
        devise: Currency.XOF,
        modePaiement: PaymentMethod.MOBILE_MONEY,
        statut: ExpenseStatus.EN_ATTENTE,
        created_at: new Date('2025-06-06T09:30:00'),
        updated_at: new Date('2025-06-06T09:30:00')
    }
];

// Configuration par défaut
export const EXPENSE_CONFIG = {
    deviseParDefaut: Currency.XOF,
    modePaiementParDefaut: PaymentMethod.VIREMENT,
    numeroPrefix: 'DEP',
    numeroFormat: 'DEP-{YYYY}-{MM}-{####}'
};
