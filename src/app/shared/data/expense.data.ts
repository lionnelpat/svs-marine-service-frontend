import { Currency, ExpenseSupplier, PaymentMethod } from '../models/expense.model';
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

// Configuration par défaut
export const EXPENSE_CONFIG = {
    deviseParDefaut: Currency.XOF,
    modePaiementParDefaut: PaymentMethod.VIREMENT,
    numeroPrefix: 'DEP',
    numeroFormat: 'DEP-{YYYY}-{MM}-{####}'
};
