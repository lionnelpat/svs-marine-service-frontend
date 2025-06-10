

export interface ExpenseSupplier {
    id: number;
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    rccm?: string | null;
    ninea?: string | null;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export interface ExpenseSupplierCreate {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    rccm?: string | null;
    ninea?: string | null;
}

export interface ExpenseSupplierUpdate {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    rccm?: string | null;
    ninea?: string | null;
}

export interface ExpenseSupplierListFilter {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface ExpenseSupplierListResponse {
    suppliers: ExpenseSupplier[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}


export interface ExpenseSupplierEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    expenseSupplier?: ExpenseSupplier;
}


