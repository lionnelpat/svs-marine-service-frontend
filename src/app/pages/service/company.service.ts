// pages/service/company.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
    Company,
    CreateCompanyRequest,
    UpdateCompanyRequest,
    CompanyListFilter,
    CompanyListResponse
} from '../../shared/models/company.model';
import { FAKE_COMPANIES } from '../../shared/data/company.data';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private companies: Company[] = [...FAKE_COMPANIES];
    private nextId = Math.max(...this.companies.map(c => c.id)) + 1;

    constructor(
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    /**
     * Récupère la liste des companies avec filtres et pagination
     */
    getCompanies(filter: CompanyListFilter = {}): Observable<CompanyListResponse> {
        this.logger.info('Récupération de la liste des companies', filter);

        try {
            let filteredCompanies = [...this.companies];

            // Filtres
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                filteredCompanies = filteredCompanies.filter(company =>
                    company.nom.toLowerCase().includes(searchLower) ||
                    company.raisonSociale.toLowerCase().includes(searchLower) ||
                    company.email.toLowerCase().includes(searchLower)
                );
            }

            if (filter.pays) {
                filteredCompanies = filteredCompanies.filter(company =>
                    company.pays.toLowerCase().includes(filter.pays!.toLowerCase())
                );
            }

            if (filter.active !== undefined) {
                filteredCompanies = filteredCompanies.filter(company =>
                    company.active === filter.active
                );
            }

            // Pagination
            const page = filter.page || 0;
            const size = filter.size || 10;
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

            const response: CompanyListResponse = {
                companies: paginatedCompanies,
                total: filteredCompanies.length,
                page,
                size
            };

            this.logger.debug(`${paginatedCompanies.length} compagnies récupérées sur ${filteredCompanies.length} total`);

            return of(response).pipe(delay(300)); // Simulation latence réseau
        } catch (error) {
            this.errorHandler.handleError(error, 'Récupération des companies');
            return throwError(() => error);
        }
    }

    /**
     * Récupère une compagnie par son ID
     */
    getCompanyById(id: number): Observable<Company> {
        this.logger.info(`Récupération de la compagnie ID: ${id}`);

        try {
            const company = this.companies.find(c => c.id === id);

            if (!company) {
                const error = new Error(`Compagnie avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Récupération compagnie');
                return throwError(() => error);
            }

            this.logger.debug(`Compagnie trouvée: ${company.nom}`);
            return of(company).pipe(delay(200));
        } catch (error) {
            this.errorHandler.handleError(error, `Récupération compagnie ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Crée une nouvelle compagnie
     */
    createCompany(request: CreateCompanyRequest): Observable<Company> {
        this.logger.info('Création d\'une nouvelle compagnie', { nom: request.nom });

        try {
            // Validation email unique
            if (this.companies.some(c => c.email === request.email)) {
                const error = new Error('Une compagnie avec cet email existe déjà');
                this.errorHandler.handleError(error, 'Création compagnie');
                return throwError(() => error);
            }

            const newCompany: Company = {
                id: this.nextId++,
                ...request,
                created_at: new Date(),
                updated_at: new Date(),
                active: true
            };

            this.companies.push(newCompany);
            this.logger.info(`Compagnie créée avec succès: ${newCompany.nom} (ID: ${newCompany.id})`);

            return of(newCompany).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, 'Création compagnie');
            return throwError(() => error);
        }
    }

    /**
     * Met à jour une compagnie existante
     */
    updateCompany(request: UpdateCompanyRequest): Observable<Company> {
        this.logger.info(`Mise à jour de la compagnie ID: ${request.id}`, { nom: request.nom });

        try {
            const index = this.companies.findIndex(c => c.id === request.id);

            if (index === -1) {
                const error = new Error(`Compagnie avec l'ID ${request.id} non trouvée`);
                this.errorHandler.handleError(error, 'Mise à jour compagnie');
                return throwError(() => error);
            }

            // Validation email unique (exclure la compagnie actuelle)
            if (this.companies.some(c => c.id !== request.id && c.email === request.email)) {
                const error = new Error('Une autre compagnie avec cet email existe déjà');
                this.errorHandler.handleError(error, 'Mise à jour compagnie');
                return throwError(() => error);
            }

            const existingCompany = this.companies[index];
            const updatedCompany: Company = {
                ...existingCompany,
                ...request,
                updated_at: new Date()
            };

            this.companies[index] = updatedCompany;
            this.logger.info(`Compagnie mise à jour avec succès: ${updatedCompany.nom}`);

            return of(updatedCompany).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, `Mise à jour compagnie ID: ${request.id}`);
            return throwError(() => error);
        }
    }

    /**
     * Supprime une compagnie
     */
    deleteCompany(id: number): Observable<boolean> {
        this.logger.info(`Suppression de la compagnie ID: ${id}`);

        try {
            const index = this.companies.findIndex(c => c.id === id);

            if (index === -1) {
                const error = new Error(`Compagnie avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Suppression compagnie');
                return throwError(() => error);
            }

            const companyName = this.companies[index].nom;
            this.companies.splice(index, 1);
            this.logger.info(`Compagnie supprimée avec succès: ${companyName}`);

            return of(true).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Suppression compagnie ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Active/désactive une compagnie
     */
    toggleCompanyStatus(id: number): Observable<Company> {
        this.logger.info(`Changement de statut de la compagnie ID: ${id}`);

        try {
            const company = this.companies.find(c => c.id === id);

            if (!company) {
                const error = new Error(`Compagnie avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Changement statut compagnie');
                return throwError(() => error);
            }

            company.active = !company.active;
            company.updated_at = new Date();

            this.logger.info(`Statut changé pour ${company.nom}: ${company.active ? 'Actif' : 'Inactif'}`);

            return of(company).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Changement statut compagnie ID: ${id}`);
            return throwError(() => error);
        }
    }
}
