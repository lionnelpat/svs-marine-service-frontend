// pages/service/operation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    Operation,
    OperationListFilter,
    OperationListResponse
    ,
    CreateOperationRequest,
    UpdateOperationRequest
} from '../../shared/models/operation.model';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class OperationService {
    private readonly apiUrl = `${environment.apiBaseUrl}/operations`;
    private readonly DEFAULT_EXCHANGE_RATE = 656;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    getOperations(filter: OperationListFilter = {}): Observable<OperationListResponse> {
        this.logger.info('Appel API - Liste des opérations', filter);

        let params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', 'nom')
            .set('sortDirection', 'asc');

        if (filter.search) params = params.set('search', filter.search);
        if (filter.active !== undefined) params = params.set('active', filter.active.toString());

        return this.http.get<ApiResponse<any>>(this.apiUrl, { params }).pipe(
            map(resp => ({
                operations: resp.data.operations,
                total: resp.data.total,
                page: resp.data.page,
                size: resp.data.size
            })),
            catchError(err => this.handleError(err, 'Chargement des opérations'))
        );
    }

    getOperationById(id: number): Observable<Operation> {
        return this.http.get<ApiResponse<Operation>>(`${this.apiUrl}/${id}`).pipe(
            map(resp => resp.data),
            catchError(err => this.handleError(err, `Chargement opération ID: ${id}`))
        );
    }

    createOperation(request: CreateOperationRequest): Observable<Operation> {
        this.logger.info('Création opération', request);

        // Auto-calcul prixEUR si manquant
        const payload = {
            ...request,
            prixEURO: this.calculateEuroPrice(request.prixXOF, request.prixEURO)
        };

        return this.http.post<ApiResponse<Operation>>(this.apiUrl, payload).pipe(
            map(resp => resp.data),
            catchError(err => this.handleError(err, 'Création opération'))
        );
    }

    updateOperation(request: UpdateOperationRequest): Observable<Operation> {
        this.logger.info('Mise à jour opération', request);

        const payload = {
            ...request,
            prixEURO: this.calculateEuroPrice(request.prixXOF, request.prixEURO)
        };

        return this.http.put<ApiResponse<Operation>>(`${this.apiUrl}/${request.id}`, payload).pipe(
            map(resp => resp.data),
            catchError(err => this.handleError(err, `Mise à jour opération ID: ${request.id}`))
        );
    }

    deleteOperation(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            map(() => true),
            catchError(err => this.handleError(err, `Suppression opération ID: ${id}`))
        );
    }

    toggleOperationStatus(id: number): Observable<Operation> {
        return this.http.patch<ApiResponse<Operation>>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
            map(resp => resp.data),
            catchError(err => this.handleError(err, `Toggle statut opération ID: ${id}`))
        );
    }

    // --- Utilitaires métier : Prix et taux de change ---

    getExchangeRate(): number {
        // Implémentation à adapter si tu veux le récupérer côté backend à terme
        return this.DEFAULT_EXCHANGE_RATE;
    }

    private calculateEuroPrice(prixXOF: number, prixEURO?: number): number {
        if (prixEURO !== undefined && prixEURO !== null && prixEURO > 0) {
            return prixEURO;
        }
        return prixXOF > 0 ? Math.round((prixXOF / this.getExchangeRate()) * 100) / 100 : 0;
    }

    hasValidEuroPrice(operation: Operation): boolean {
        return operation.prixEURO !== undefined && operation.prixEURO !== null && operation.prixEURO > 0;
    }

    getEuroPriceWithFallback(operation: Operation): number {
        return this.hasValidEuroPrice(operation)
            ? operation.prixEURO!
            : this.calculateEuroPrice(operation.prixXOF);
    }

    // --- Gestion d’erreur centralisée ---
    private handleError(error: any, context: string) {
        const message = error?.error?.message || error.message || 'Erreur inconnue';
        this.logger.error(`${context} - ${message}`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => new Error(message));
    }
}
