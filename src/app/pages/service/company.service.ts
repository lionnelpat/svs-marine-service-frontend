// pages/service/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    Company,
    CreateCompanyRequest,
    UpdateCompanyRequest,
    CompanyListFilter,
    CompanyListResponse
} from '../../shared/models';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    // private readonly baseUrl = 'companies';
    private readonly apiBaseUrl = `${environment.apiBaseUrl}/${environment.apiVersion}`;

    private readonly  headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    getCompanies(filter: CompanyListFilter = {}): Observable<CompanyListResponse> {
        this.logger.info('Appel API - Liste des compagnies', filter);

        let params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', 'nom')
            .set('sortDirection', 'asc');

        if (filter.search) {
            params = params.set('search', filter.search);
        }

        if (filter.pays) {
            params = params.set('pays', filter.pays);
        }

        if (filter.active !== undefined) {
            params = params.set('active', filter.active.toString());
        }

        return this.http.get<any>(`${this.apiBaseUrl}/companies`, {
            headers: this.headers,
            withCredentials: true,
            params
        }).pipe(
            map(response => ({
                companies: response.companies,
                total: response.total,
                page: response.page,
                size: response.size
            })),
            catchError(err => this.handleError(err, 'Chargement des compagnies'))
        );
    }

    getCompanyById(id: number): Observable<Company> {
        return this.http.get<Company>(`${this.apiBaseUrl}/companies/${id}`).pipe(
            catchError(err => this.handleError(err, `Chargement compagnie ID: ${id}`))
        );
    }

    createCompany(request: CreateCompanyRequest): Observable<Company> {
        return this.http.post<Company>(`${this.apiBaseUrl}/companies`, request).pipe(
            catchError(err => this.handleError(err, 'Création compagnie'))
        );
    }

    updateCompany(request: UpdateCompanyRequest): Observable<Company> {
        return this.http.put<Company>(`${this.apiBaseUrl}/companies/${request.id}`, request).pipe(
            catchError(err => this.handleError(err, `Mise à jour compagnie ID: ${request.id}`))
        );
    }

    deleteCompany(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiBaseUrl}/companies/${id}`).pipe(
            map(() => true),
            catchError(err => this.handleError(err, `Suppression compagnie ID: ${id}`))
        );
    }

    toggleCompanyStatus(id: number): Observable<Company> {
        return this.http.patch<Company>(`${this.apiBaseUrl}/companies/${id}/toggle-status`, {}).pipe(
            catchError(err => this.handleError(err, `Toggle status compagnie ID: ${id}`))
        );
    }

    private handleError(error: any, context: string) {
        this.logger.error(`${context} - Erreur`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => error);
    }
}
