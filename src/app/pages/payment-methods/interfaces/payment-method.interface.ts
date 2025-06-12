// Interface principale PaymentMethod

export interface PaymentMethod {
    id: number;
    nom: string;
    code: string;
    description?: string;
    actif?: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}

export interface PaymentMethodEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    paymentMethod?: PaymentMethod;
}

// Interface pour la création d'un mode de paiement
export interface PaymentMethodCreate {
    nom: string;
    code: string;
    description?: string;
}

// Interface pour la mise à jour d'un mode de paiement
export interface PaymentMethodUpdate {
    nom?: string;
    code: string;
    description?: string;
}

// Interface pour la recherche et filtres
export interface PaymentMethodFilter {
    query?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

// Interface pour les statistiques
export interface PaymentMethodStats {
    total_count: number;
    active_count: number;
    inactive_count: number;
}

// Interface pour la réponse API paginée
export interface PaymentMethodPageResponse {
    content: PaymentMethod[];
    page: {
        size: number;
        number: number;
        total_elements: number;
        total_pages: number;
    };
}

export interface PaymentMethodListResponse {
    paymentMethods: PaymentMethod[];
    totalElements: number,
    currentPage: number,
    size: number,
    totalPages: number,
    first: boolean,
    last: boolean,
    hasNext: boolean,
    hasPrevious: boolean
}

// Interface pour la réponse API standard
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// Type pour les réponses spécifiques
export type PaymentMethodResponse = ApiResponse<PaymentMethod>;
export type PaymentMethodPagedResponse = ApiResponse<PaymentMethodPageResponse>;
export type PaymentMethodStatsResponse = ApiResponse<PaymentMethodStats>;

// Enum pour les statuts (si nécessaire côté frontend)
export enum PaymentMethodStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

// Interface pour les options de tri
export interface PaymentMethodSortOption {
    label: string;
    value: string;
    direction: 'asc' | 'desc';
}



// Interface pour les messages d'erreur
export interface PaymentMethodErrors {
    nom?: string[];
    code?: string[];
    description?: string[];
}

// Interface pour le formulaire de mode de paiement
export interface PaymentMethodForm {
    id?: number;
    nom: string;
    code: string;
    description: string;
    actif: boolean;
}

// Valeurs par défaut pour le formulaire
export const DEFAULT_PAYMENT_METHOD_FORM: PaymentMethodForm = {
    nom: '',
    code: '',
    description: '',
    actif: true
};
