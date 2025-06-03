// shared/data/operation.data.ts - Version Sénégal
import { Operation } from '../models/operation.model';

export const FAKE_OPERATIONS: Operation[] = [
    {
        id: 1,
        nom: 'Pilotage d\'entrée Port de Dakar',
        description: 'Service de pilotage obligatoire pour l\'entrée des navires dans le port autonome de Dakar',
        code: 'PIL-ENT-001',
        prixXOF: 185000,
        prixEURO: 282.00,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-11-20'),
        active: true
    },
    {
        id: 2,
        nom: 'Pilotage de sortie Port de Dakar',
        description: 'Service de pilotage obligatoire pour la sortie des navires du port autonome de Dakar',
        code: 'PIL-SOR-002',
        prixXOF: 185000,
        prixEURO: 282.00,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-11-20'),
        active: true
    },
    {
        id: 3,
        nom: 'Remorquage assistance manœuvre',
        description: 'Service de remorquage pour assistance aux manœuvres d\'accostage et d\'appareillage',
        code: 'REM-ASS-003',
        prixXOF: 155000,
        prixEURO: 236.50,
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-12-01'),
        active: true
    },
    {
        id: 4,
        nom: 'Amarrage navire au quai',
        description: 'Service d\'amarrage et désarramage des navires aux postes à quai du port',
        code: 'AMA-NAV-004',
        prixXOF: 75000,
        prixEURO: 114.50,
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-11-25'),
        active: true
    },
    {
        id: 5,
        nom: 'Lamanage accostage',
        description: 'Service de lamanage pour les opérations d\'accostage et d\'appareillage',
        code: 'LAM-ACC-005',
        prixXOF: 45000,
        prixEURO: 68.70,
        created_at: new Date('2024-03-05'),
        updated_at: new Date('2024-10-15'),
        active: true
    },
    {
        id: 6,
        nom: 'Gardiennage navire 24h',
        description: 'Service de surveillance et gardiennage des navires à quai pendant 24 heures',
        code: 'GAR-NAV-006',
        prixXOF: 25000,
        prixEURO: 38.15,
        created_at: new Date('2024-03-15'),
        updated_at: new Date('2024-09-30'),
        active: true
    },
    {
        id: 7,
        nom: 'Inspection technique coque',
        description: 'Service d\'inspection technique de la coque et des équipements de sécurité',
        code: 'INS-COQ-007',
        prixXOF: 125000,
        prixEURO: 190.80,
        created_at: new Date('2024-04-01'),
        updated_at: new Date('2024-11-10'),
        active: true
    },
    {
        id: 8,
        nom: 'Avitaillement eau douce',
        description: 'Fourniture d\'eau douce potable pour les navires (par m³)',
        code: 'AVI-EAU-008',
        prixXOF: 3500,
        prixEURO: 5.35,
        created_at: new Date('2024-04-15'),
        updated_at: new Date('2024-08-20'),
        active: true
    },
    {
        id: 9,
        nom: 'Évacuation déchets solides',
        description: 'Service d\'évacuation et traitement des déchets solides des navires',
        code: 'EVA-DEC-009',
        prixXOF: 35000,
        prixEURO: 53.45,
        created_at: new Date('2024-05-01'),
        updated_at: new Date('2024-07-15'),
        active: false
    },
    {
        id: 10,
        nom: 'Manutention conteneurs 20 pieds',
        description: 'Service de manutention et déplacement des conteneurs 20 pieds',
        code: 'MAN-C20-010',
        prixXOF: 85000,
        prixEURO: 129.80,
        created_at: new Date('2024-05-20'),
        updated_at: new Date('2024-12-02'),
        active: true
    },
    {
        id: 11,
        nom: 'Manutention conteneurs 40 pieds',
        description: 'Service de manutention et déplacement des conteneurs 40 pieds',
        code: 'MAN-C40-011',
        prixXOF: 145000,
        prixEURO: 221.40,
        created_at: new Date('2024-05-20'),
        updated_at: new Date('2024-12-02'),
        active: true
    },
    {
        id: 12,
        nom: 'Contrôle sécurité ISPS',
        description: 'Contrôle de sécurité conforme au code ISPS international',
        code: 'SEC-ISPS-012',
        prixXOF: 165000,
        prixEURO: 252.00,
        created_at: new Date('2024-06-01'),
        updated_at: new Date('2024-11-30'),
        active: true
    },
    {
        id: 13,
        nom: 'Assistance technique urgente',
        description: 'Assistance technique d\'urgence pour pannes et réparations mineures',
        code: 'ASS-URG-013',
        prixXOF: 95000,
        prixEURO: 145.20,
        created_at: new Date('2024-06-15'),
        updated_at: new Date('2024-10-25'),
        active: true
    },
    {
        id: 14,
        nom: 'Nettoyage cale sèche',
        description: 'Service de nettoyage des cales sèches après déchargement',
        code: 'NET-CAL-014',
        prixXOF: 55000,
        prixEURO: 84.00,
        created_at: new Date('2024-07-01'),
        updated_at: new Date('2024-11-15'),
        active: true
    },
    {
        id: 15,
        nom: 'Soutage carburant',
        description: 'Service d\'approvisionnement en carburant marine (par tonne)',
        code: 'SOU-CAR-015',
        prixXOF: 950000,
        prixEURO: 1450.00,
        created_at: new Date('2024-07-15'),
        updated_at: new Date('2024-12-01'),
        active: true
    }
];
