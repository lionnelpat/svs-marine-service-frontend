// src/app/shared/data/invoice.data.ts

import { Invoice, InvoiceStatus, InvoiceLineItem } from '../models/invoice.model';
import { Company } from '../models/company.model';
import { Ship } from '../models/ship.model';
import { Operation } from '../models/operation.model';

// Données de test pour les compagnies (basées sur votre capture d'écran)
export const MOCK_COMPANIES: Company[] = [
    {
        id: 1,
        nom: 'COSAMA',
        raisonSociale: 'Compagnie Sénégalaise de Manutention Maritime',
        adresse: 'Port de Dakar, BP 123',
        ville: 'Dakar',
        pays: 'Sénégal',
        telephone: '+221 77 123 45 67',
        email: 'contact@cosama.sn',
        contactPrincipal: 'Mamadou Diop',
        telephoneContact: '+221 77 123 45 67',
        emailContact: 'mdiop@cosama.sn',
        rccm: 'SN-DKR-2010-B-1234',
        ninea: '001234567890123',
        siteWeb: 'www.cosama.sn',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2025-06-01'),
        active: true
    },
    {
        id: 2,
        nom: 'SOMAPORT',
        raisonSociale: 'Société de Manutention du Port de Dakar',
        adresse: 'Zone Portuaire, Dakar',
        ville: 'Dakar',
        pays: 'Sénégal',
        telephone: '+221 77 234 56 78',
        email: 'info@somaport.sn',
        contactPrincipal: 'Fatou Sall',
        telephoneContact: '+221 77 234 56 78',
        emailContact: 'fsall@somaport.sn',
        rccm: 'SN-DKR-2015-B-5678',
        ninea: '001234567890456',
        created_at: new Date('2023-02-20'),
        updated_at: new Date('2025-06-01'),
        active: true
    },
    {
        id: 3,
        nom: 'SENEGALAISE DE TRANSIT',
        raisonSociale: 'Compagnie Sénégalaise de Transit et Consignation',
        adresse: '15 Avenue Lamine Guèye, Dakar',
        ville: 'Dakar',
        pays: 'Sénégal',
        telephone: '+221 77 345 67 89',
        email: 'contact@senetransit.sn',
        contactPrincipal: 'Ousmane Ba',
        telephoneContact: '+221 77 345 67 89',
        emailContact: 'oba@senetransit.sn',
        rccm: 'SN-DKR-2018-B-9012',
        ninea: '001234567890789',
        created_at: new Date('2023-03-10'),
        updated_at: new Date('2025-06-01'),
        active: true
    },
    {
        id: 4,
        nom: 'MSC SENEGAL',
        raisonSociale: 'Mediterranean Shipping Company Sénégal',
        adresse: 'Immeuble Fahd, Dakar',
        ville: 'Dakar',
        pays: 'Sénégal',
        telephone: '+221 77 890 12 34',
        email: 'info@msc.sn',
        contactPrincipal: 'Cheikh Sy',
        telephoneContact: '+221 77 890 12 34',
        emailContact: 'csy@msc.sn',
        rccm: 'SN-DKR-2020-B-3456',
        ninea: '001234567890345',
        created_at: new Date('2023-04-05'),
        updated_at: new Date('2025-06-01'),
        active: true
    }
];

// Données de test pour les navires
export const MOCK_SHIPS: Ship[] = [
    {
        id: 1,
        nom: 'MV DAKAR STAR',
        numeroIMO: '9123456',
        pavillon: 'Sénégal',
        typeNavire: 'Cargo',
        compagnieId: 1,
        portAttache: 'Dakar',
        numeroAppel: 'DAKSTAR',
        numeroMMSI: '663123456',
        classification: 'DNV GL',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2025-06-01'),
        active: true
    },
    {
        id: 2,
        nom: 'MSC MEDITERRANEAN',
        numeroIMO: '9234567',
        pavillon: 'Libéria',
        typeNavire: 'Container',
        nombrePassagers: 0,
        compagnieId: 4,
        portAttache: 'Monrovia',
        numeroAppel: 'MSCMED',
        numeroMMSI: '636234567',
        classification: 'Lloyd\'s Register',
        created_at: new Date('2023-02-20'),
        updated_at: new Date('2025-06-01'),
        active: true
    },
    {
        id: 3,
        nom: 'ATLANTIC PIONEER',
        numeroIMO: '9345678',
        pavillon: 'Panama',
        typeNavire: 'Pétrolier',
        compagnieId: 3,
        portAttache: 'Panama City',
        numeroAppel: 'ATLPION',
        numeroMMSI: '351345678',
        classification: 'ABS',
        created_at: new Date('2023-03-10'),
        updated_at: new Date('2025-06-01'),
        active: true
    }
];

// Données de test pour les opérations
export const MOCK_OPERATIONS: Operation[] = [
    {
        id: 1,
        nom: 'Pilotage d\'entrée',
        description: 'Service de pilotage pour l\'entrée au port de Dakar',
        code: 'PIL-ENT',
        prixXOF: 125000,
        prixEURO: 190.50,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2025-06-01'),
        active: true
    },
    {
        id: 2,
        nom: 'Remorquage',
        description: 'Service de remorquage portuaire',
        code: 'REM-001',
        prixXOF: 75000,
        prixEURO: 114.30,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2025-06-01'),
        active: true
    },
    {
        id: 3,
        nom: 'Manutention',
        description: 'Services de manutention des marchandises',
        code: 'MAN-001',
        prixXOF: 8500,
        prixEURO: 12.95,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2025-06-01'),
        active: true
    },
    {
        id: 4,
        nom: 'Gardiennage',
        description: 'Service de gardiennage et sécurité 24h',
        code: 'GAR-001',
        prixXOF: 15000,
        prixEURO: 22.85,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2025-06-01'),
        active: true
    },
    {
        id: 5,
        nom: 'Amarrage/Désamarrage',
        description: 'Service d\'amarrage et désamarrage',
        code: 'AMA-001',
        prixXOF: 45000,
        prixEURO: 68.55,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2025-06-01'),
        active: true
    }
];

// Données de test pour les factures
export const MOCK_INVOICES: Invoice[] = [
    {
        id: 1,
        numero: 'FAC-2025-06-0001',
        compagnieId: 1,
        compagnie: MOCK_COMPANIES[0],
        navireId: 1,
        navire: MOCK_SHIPS[0],
        dateFacture: new Date('2025-06-01'),
        dateEcheance: new Date('2025-07-01'),
        prestations: [
            {
                id: 1,
                operationId: 1,
                operation: MOCK_OPERATIONS[0],
                description: 'Pilotage d\'entrée au port',
                quantite: 1,
                prixUnitaireXOF: 125000,
                prixUnitaireEURO: 190.50,
                montantXOF: 125000,
                montantEURO: 190.50
            },
            {
                id: 2,
                operationId: 2,
                operation: MOCK_OPERATIONS[1],
                description: 'Remorquage d\'assistance',
                quantite: 2,
                prixUnitaireXOF: 75000,
                prixUnitaireEURO: 114.30,
                montantXOF: 150000,
                montantEURO: 228.60
            }
        ],
        sousTotal: 275000,
        tauxTva: 18,
        tva: 49500,
        montantTotal: 324500,
        statut: InvoiceStatus.PAYEE,
        notes: 'Facture pour services portuaires - Escale du 01/06/2025',
        created_at: new Date('2025-06-01T10:00:00'),
        updated_at: new Date('2025-06-15T14:30:00'),
        active: true
    },
    {
        id: 2,
        numero: 'FAC-2025-06-0002',
        compagnieId: 4,
        compagnie: MOCK_COMPANIES[3],
        navireId: 2,
        navire: MOCK_SHIPS[1],
        dateFacture: new Date('2025-06-02'),
        dateEcheance: new Date('2025-07-02'),
        prestations: [
            {
                id: 3,
                operationId: 3,
                operation: MOCK_OPERATIONS[2],
                description: 'Manutention conteneurs',
                quantite: 50,
                prixUnitaireXOF: 8500,
                prixUnitaireEURO: 12.95,
                montantXOF: 425000,
                montantEURO: 647.50
            },
            {
                id: 4,
                operationId: 4,
                operation: MOCK_OPERATIONS[3],
                description: 'Gardiennage 24h',
                quantite: 24,
                prixUnitaireXOF: 15000,
                prixUnitaireEURO: 22.85,
                montantXOF: 360000,
                montantEURO: 548.40
            }
        ],
        sousTotal: 785000,
        tauxTva: 18,
        tva: 141300,
        montantTotal: 926300,
        statut: InvoiceStatus.EMISE,
        notes: 'Services de manutention et gardiennage',
        created_at: new Date('2025-06-02T08:15:00'),
        updated_at: new Date('2025-06-02T08:15:00'),
        active: true
    },
    {
        id: 3,
        numero: 'FAC-2025-05-0015',
        compagnieId: 3,
        compagnie: MOCK_COMPANIES[2],
        navireId: 3,
        navire: MOCK_SHIPS[2],
        dateFacture: new Date('2025-05-28'),
        dateEcheance: new Date('2025-06-27'),
        prestations: [
            {
                id: 5,
                operationId: 1,
                operation: MOCK_OPERATIONS[0],
                description: 'Pilotage pétrolier',
                quantite: 1,
                prixUnitaireXOF: 125000,
                prixUnitaireEURO: 190.50,
                montantXOF: 125000,
                montantEURO: 190.50
            },
            {
                id: 6,
                operationId: 5,
                operation: MOCK_OPERATIONS[4],
                description: 'Amarrage pétrolier',
                quantite: 2,
                prixUnitaireXOF: 45000,
                prixUnitaireEURO: 68.55,
                montantXOF: 90000,
                montantEURO: 137.10
            }
        ],
        sousTotal: 215000,
        tauxTva: 18,
        tva: 38700,
        montantTotal: 253700,
        statut: InvoiceStatus.EN_RETARD,
        notes: 'Pilotage et amarrage pour pétrolier',
        created_at: new Date('2025-05-28T16:45:00'),
        updated_at: new Date('2025-05-28T16:45:00'),
        active: true
    },
    {
        id: 4,
        numero: 'FAC-2025-06-0003',
        compagnieId: 1,
        compagnie: MOCK_COMPANIES[0],
        navireId: 2,
        navire: MOCK_SHIPS[1],
        dateFacture: new Date('2025-06-03'),
        dateEcheance: new Date('2025-07-03'),
        prestations: [
            {
                id: 7,
                operationId: 2,
                operation: MOCK_OPERATIONS[1],
                description: 'Remorquage d\'assistance',
                quantite: 3,
                prixUnitaireXOF: 75000,
                prixUnitaireEURO: 114.30,
                montantXOF: 225000,
                montantEURO: 342.90
            },
            {
                id: 8,
                operationId: 4,
                operation: MOCK_OPERATIONS[3],
                description: 'Gardiennage escale',
                quantite: 12,
                prixUnitaireXOF: 15000,
                prixUnitaireEURO: 22.85,
                montantXOF: 180000,
                montantEURO: 274.20
            },
            {
                id: 9,
                operationId: 5,
                operation: MOCK_OPERATIONS[4],
                description: 'Amarrage/Désamarrage',
                quantite: 4,
                prixUnitaireXOF: 45000,
                prixUnitaireEURO: 68.55,
                montantXOF: 180000,
                montantEURO: 274.20
            }
        ],
        sousTotal: 585000,
        tauxTva: 18,
        tva: 105300,
        montantTotal: 690300,
        statut: InvoiceStatus.BROUILLON,
        notes: 'Brouillon - Services complets',
        created_at: new Date('2025-06-03T11:20:00'),
        updated_at: new Date('2025-06-03T11:20:00'),
        active: true
    }
];

// Configuration de l'entreprise pour les factures
export const COMPANY_CONFIG = {
    nom: 'SALANE VISION S.A.R.L',
    adresse: 'Cité Elisabeth DIOUF, villa 60, Dakar, Sénégal',
    telephone: '+221 77 656 66 09 / +221 76 590 69 89',
    email: 'facturation@svs.sn',
    ninea: '009219869',
    rccm: 'SN-DKR-2022-B-6304',
    logo: 'assets/images/logo.jpeg'
};
