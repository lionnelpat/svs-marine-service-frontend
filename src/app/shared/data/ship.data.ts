// shared/data/ship.data.ts - Navires au Sénégal
import { Ship } from '../models/ship.model';

export const FAKE_SHIPS: Ship[] = [
    {
        id: 1,
        nom: 'DAKAR EXPRESS',
        numeroIMO: '9876543',
        pavillon: 'Sénégal',
        typeNavire: 'Conteneur',
        compagnieId: 1, // COSAMA
        portAttache: 'Dakar',
        numeroAppel: 'DAEX',
        numeroMMSI: '663001234',
        classification: 'Bureau Veritas',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-11-25'),
        active: true
    },
    {
        id: 2,
        nom: 'TERANGA STAR',
        numeroIMO: '9876544',
        pavillon: 'Sénégal',
        typeNavire: 'Cargo',
        compagnieId: 2, // SOMAPORT
        portAttache: 'Dakar',
        numeroAppel: 'TSTR',
        numeroMMSI: '663001235',
        classification: 'Bureau Veritas',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-12-01'),
        active: true
    },
    {
        id: 3,
        nom: 'BAOBAB VOYAGER',
        numeroIMO: '9876545',
        pavillon: 'Sénégal',
        typeNavire: 'Passagers',
        nombrePassagers: 280,
        compagnieId: 3, // SENEGALAISE DE TRANSIT
        portAttache: 'Dakar',
        numeroAppel: 'BAOB',
        numeroMMSI: '663001236',
        classification: 'Lloyd\'s Register',
        created_at: new Date('2024-02-05'),
        updated_at: new Date('2024-11-20'),
        active: true
    },
    {
        id: 4,
        nom: 'SAHEL TRADER',
        numeroIMO: '9876546',
        pavillon: 'Liberia',
        typeNavire: 'Vraqueur',
        compagnieId: 4, // SAGOMAR
        portAttache: 'Monrovia',
        numeroAppel: 'SATR',
        numeroMMSI: '636001237',
        classification: 'DNV GL',
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-10-30'),
        active: true
    },
    {
        id: 5,
        nom: 'ATLANTIC PEARL',
        numeroIMO: '9876547',
        pavillon: 'Panama',
        typeNavire: 'Pétrolier',
        compagnieId: 6, // MAERSK SENEGAL
        portAttache: 'Panama City',
        numeroAppel: 'ATPE',
        numeroMMSI: '354001238',
        classification: 'American Bureau of Shipping',
        created_at: new Date('2024-03-10'),
        updated_at: new Date('2024-11-15'),
        active: true
    },
    {
        id: 6,
        nom: 'CASAMANCE QUEEN',
        numeroIMO: '9876548',
        pavillon: 'Sénégal',
        typeNavire: 'Ro-Ro',
        nombrePassagers: 450,
        compagnieId: 1, // COSAMA
        portAttache: 'Dakar',
        numeroAppel: 'CASQ',
        numeroMMSI: '663001239',
        classification: 'RINA',
        created_at: new Date('2024-03-25'),
        updated_at: new Date('2024-12-05'),
        active: true
    },
    {
        id: 7,
        nom: 'GOREE NAVIGATOR',
        numeroIMO: '9876549',
        pavillon: 'Sénégal',
        typeNavire: 'Remorqueur',
        compagnieId: 2, // SOMAPORT
        portAttache: 'Dakar',
        numeroAppel: 'GONA',
        numeroMMSI: '663001240',
        classification: 'Bureau Veritas',
        created_at: new Date('2024-04-12'),
        updated_at: new Date('2024-09-20'),
        active: true
    },
    {
        id: 8,
        nom: 'MSC SENEGAMBIA',
        numeroIMO: '9876550',
        pavillon: 'Liberia',
        typeNavire: 'Conteneur',
        compagnieId: 8, // MSC SENEGAL
        portAttache: 'Monrovia',
        numeroAppel: 'MSCS',
        numeroMMSI: '636001241',
        classification: 'ClassNK',
        created_at: new Date('2024-05-08'),
        updated_at: new Date('2024-11-30'),
        active: true
    },
    {
        id: 9,
        nom: 'CMA CGM LEBU',
        numeroIMO: '9876551',
        pavillon: 'France',
        typeNavire: 'Conteneur',
        compagnieId: 7, // CMA CGM SENEGAL
        portAttache: 'Le Havre',
        numeroAppel: 'LEBU',
        numeroMMSI: '227001242',
        classification: 'Bureau Veritas',
        created_at: new Date('2024-06-15'),
        updated_at: new Date('2024-10-18'),
        active: true
    },
    {
        id: 10,
        nom: 'SINE SALOUM',
        numeroIMO: '9876552',
        pavillon: 'Sénégal',
        typeNavire: 'Frigorifique',
        compagnieId: 3, // SENEGALAISE DE TRANSIT
        portAttache: 'Dakar',
        numeroAppel: 'SINS',
        numeroMMSI: '227001232',
        classification: 'Bureau Veritas',
        created_at: new Date('2024-06-15'),
        updated_at: new Date('2024-10-18'),
        active: true
    }
    ];
