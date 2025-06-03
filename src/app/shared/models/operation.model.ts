// shared/models/operation.model.ts
export interface Operation {
    id: number;
    nom: string;
    description: string;
    code: string;
    prixXOF: number;
    prixEURO?: number;
    created_at: Date;
    updated_at: Date;
    active: boolean;
}

export interface CreateOperationRequest {
    nom: string;
    description: string;
    code: string;
    prixXOF: number;
    prixEURO?: number;
}

export interface UpdateOperationRequest extends CreateOperationRequest {
    id: number;
}

export interface OperationListFilter {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface OperationListResponse {
    operations: Operation[];
    total: number;
    page: number;
    size: number;
}
