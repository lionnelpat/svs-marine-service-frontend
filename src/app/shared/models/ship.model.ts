// shared/models/ship.model.ts
import { Company } from './company.model';

export interface Ship {
    id: number;
    nom: string;
    numeroIMO: string;
    pavillon: string;
    typeNavire: string;
    nombrePassagers?: number;
    compagnieId: number;
    compagnie?: Company; // Relation avec la compagnie
    portAttache: string;
    numeroAppel: string;
    numeroMMSI: string;
    classification: string;
    created_at: Date;
    updated_at: Date;
    active: boolean;
}

export interface CreateShipRequest {
    nom: string;
    numeroIMO: string;
    pavillon: string;
    typeNavire: string;
    nombrePassagers?: number;
    compagnieId: number;
    numeroAppel: string;
    numeroMMSI: string;
    classification: string;
}

export interface UpdateShipRequest extends CreateShipRequest {
    id: number;
}

export interface ShipListFilter {
    search?: string;
    compagnieId?: number;
    typeNavire?: string;
    pavillon?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface DropdownListResponse {
    label: string;
    value: string;
}

export interface ShipListResponse {
    ships: Ship[];
    total: number;
    page: number;
    size: number;
}

// Types d'énumération pour les dropdowns
export const SHIP_TYPES = [
    'Cargo',
    'Conteneur',
    'Pétrolier',
    'Vraqueur',
    'Passagers',
    'Ro-Ro',
    'Frigorifique',
    'Chimiquier',
    'Gazier',
    'Remorqueur',
    'Pilote'
] as const;

export const SHIP_FLAGS = [
    'Sénégal',
    'France',
    'Liberia',
    'Panama',
    'Marshall Islands',
    'Singapour',
    'Bahamas',
    'Malta',
    'Chypre',
    'Grèce'
] as const;

export const SHIP_CLASSIFICATIONS = [
    'Bureau Veritas',
    'Lloyd\'s Register',
    'DNV GL',
    'American Bureau of Shipping',
    'ClassNK',
    'RINA',
    'CCS',
    'RS',
    'KR',
    'IRS'
] as const;
