import { Company } from '../models/company.model';

export interface CompanyListEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    company?: Company;
}
