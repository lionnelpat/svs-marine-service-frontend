// shared/models/company.model.ts
export interface Company {
    id: number;
    nom: string;
    raisonSociale: string;
    adresse: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    contactPrincipal?: string;
    telephoneContact?: string;
    emailContact?: string;
    rccm?: string;
    ninea?: string;
    siteWeb?: string;
    created_at: Date;
    updated_at: Date;
    active: boolean;
}

export interface CreateCompanyRequest {
    nom: string;
    raisonSociale: string;
    adresse: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    contactPrincipal?: string;
    telephoneContact?: string;
    emailContact?: string;
    rccm?: string;
    nina?: string;
    siteWeb?: string;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {
    id: number;
}

export interface CompanyListFilter {
    search?: string;
    pays?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface CompanyListResponse {
    companies: Company[];
    total: number;
    page: number;
    size: number;
}
