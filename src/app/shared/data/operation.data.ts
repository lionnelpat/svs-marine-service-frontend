// shared/data/operation.data.ts
import { Operation } from '../models/operation.model';

export const FAKE_OPERATIONS: Operation[] = [
    {
        id: 1,
        nom: 'Pilotage d\'entrée',
        description: 'Service de pilotage pour l\'entrée des navires dans le port',
        code: 'PIL-ENT-001',
        prixXOF: 125000,
        prixEURO: 190.50,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-11-20'),
        active: true
    },
    {
        id: 2,
        nom: 'Pilotage de sortie',
        description: 'Service de pilotage pour la sortie des navires du port',
        code: 'PIL-SOR-002',
        prixXOF: 125000,
        prixEURO: 190.50,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-11-20'),
        active: true
    },
    {
        id: 3,
        nom: 'Remorquage assistance',
        description: 'Service de remorquage pour assistance aux manœuvres portuaires',
        code: 'REM-ASS-003',
        prixXOF: 85000,
        prixEURO: 129.60,
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-12-01'),
        active: true
    },
    {
        id: 4,
        nom: 'Amarrage navire',
        description: 'Service d\'amarrage et désarramage des navires à quai',
        code: 'AMA-NAV-004',
        prixXOF: 45000,
        prixEURO: 68.60,
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-11-25'),
        active: true
    },
    {
        id: 5,
        nom: 'Lamanage',
        description: 'Service de lamanage pour les opérations d\'accostage',
        code: 'LAM-ACC-005',
        prixXOF: 35000,
        prixEURO: 53.35,
        created_at: new Date('2024-03-05'),
        updated_at: new Date('2024-10-15'),
        active: true
    },
    {
        id: 6,
        nom: 'Gardiennage navire',
        description: 'Service de surveillance et gardiennage des navires à quai',
        code: 'GAR-NAV-006',
        prixXOF: 15000,
        prixEURO: 22.87,
        created_at: new Date('2024-03-15'),
        updated_at: new Date('2024-09-30'),
        active: true
    },
    {
        id: 7,
        nom: 'Inspection coque',
        description: 'Service d\'inspection technique de la coque des navires',
        code: 'INS-COQ-007',
        prixXOF: 75000,
        prixEURO: 114.34,
        created_at: new Date('2024-04-01'),
        updated_at: new Date('2024-11-10'),
        active: true
    },
    {
        id: 8,
        nom: 'Avitaillement eau douce',
        description: 'Fourniture d\'eau douce pour les navires',
        code: 'AVI-EAU-008',
        prixXOF: 2500,
        prixEURO: 3.81,
        created_at: new Date('2024-04-15'),
        updated_at: new Date('2024-08-20'),
        active: true
    },
    {
        id: 9,
        nom: 'Évacuation déchets',
        description: 'Service d\'évacuation et traitement des déchets des navires',
        code: 'EVA-DEC-009',
        prixXOF: 25000,
        prixEURO: 38.11,
        created_at: new Date('2024-05-01'),
        updated_at: new Date('2024-07-15'),
        active: false
    },
    {
        id: 10,
        nom: 'Manutention conteneurs',
        description: 'Service de manutention et déplacement des conteneurs',
        code: 'MAN-CON-010',
        prixXOF: 55000,
        prixEURO: 83.85,
        created_at: new Date('2024-05-20'),
        updated_at: new Date('2024-12-02'),
        active: true
    },
    {
        id: 11,
        nom: 'Contrôle sécurité ISPS',
        description: 'Contrôle de sécurité conforme au code ISPS',
        code: 'SEC-ISPS-011',
        prixXOF: 95000,
        prixEURO: 144.83,
        created_at: new Date('2024-06-01'),
        updated_at: new Date('2024-11-30'),
        active: true
    },
    {
        id: 12,
        nom: 'Assistance technique',
        description: 'Assistance technique générale pour les navires',
        code: 'ASS-TEC-012',
        prixXOF: 65000,
        prixEURO: 99.09,
        created_at: new Date('2024-06-15'),
        updated_at: new Date('2024-10-25'),
        active: false
    }
];
