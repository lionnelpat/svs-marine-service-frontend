import { Company } from './company.model';

export interface ExpenseCategory {
    id: number;
    nom: string;
    code: string;
    description?: string;
    icone: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

export interface ExpenseCategoryCreate {
    nom: string;
    code: string;
    description?: string;
    icone: string;
}

export interface ExpenseCategoryUpdate {
    nom: string;
    description?: string;
    icone: string;
}

export interface ExpenseCategoryListFilter {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface ExpenseCategoryListResponse {
    categories: ExpenseCategory[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}


export interface ExpenseCategoryEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    expenseCategory?: ExpenseCategory;
}


