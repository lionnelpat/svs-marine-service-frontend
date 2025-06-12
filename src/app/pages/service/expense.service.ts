// src/app/pages/expenses/service/expense.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
    Expense,
    ExpenseCreateRequest,
    ExpenseListFilter,
    ExpenseListResponse,
    ExpensePageResponse,
    ExpenseSearchFilter,
    ExpenseStatsResponse,
    ExpenseStatus,
    ExpenseStatusChangeRequest,
    ExpenseUpdateRequest
} from '../../shared/models/expense.model';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ApiResponse } from '../../core/interfaces/api-response.interface';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private readonly apiUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/expenses`;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {
        this.logger.info('ExpenseService initialisé');
    }

    // ========== CRUD de base ==========

    /**
     * Créer une nouvelle dépense
     */
    createExpense(request: ExpenseCreateRequest): Observable<Expense> {
        this.logger.info('Création d\'une nouvelle dépense', request);

        return this.http.post<ApiResponse<Expense>>(`${this.apiUrl}`, request).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Création de la dépense'))
        );
    }

    /**
     * Mettre à jour une dépense
     */
    updateExpense(id: number, request: ExpenseUpdateRequest): Observable<Expense> {
        this.logger.info(`Mise à jour de la dépense ${id}`, request);

        return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${id}`, request).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Mise à jour de la dépense'))
        );
    }

    /**
     * Récupérer une dépense par ID
     */
    getExpenseById(id: number): Observable<Expense> {
        this.logger.info(`Récupération de la dépense ${id}`);

        return this.http.get<ApiResponse<Expense>>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Récupération de la dépense'))
        );
    }

    /**
     * Supprimer une dépense
     */
    deleteExpense(id: number): Observable<void> {
        this.logger.info(`Suppression de la dépense ${id}`);

        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
            map(() => void 0),
            catchError(err => this.handleError(err, 'Suppression de la dépense'))
        );
    }

    // ========== Recherche et filtres ==========

    /**
     * Récupérer les dépenses avec filtres et pagination
     */
    getExpenses(filter?: ExpenseListFilter): Observable<ExpenseListResponse> {
        this.logger.info('Récupération des dépenses avec filtres', filter);

        const searchFilter = this.mapToSearchFilter(filter);
        let params = this.buildHttpParams(searchFilter);

        return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Récupération des dépenses'))
        );
    }

    /**
     * Recherche textuelle dans les dépenses
     */
    searchExpenses(query: string, page = 0, size = 20): Observable<ExpenseListResponse> {
        this.logger.info(`Recherche textuelle: "${query}"`);

        let params = new HttpParams()
            .set('query', query)
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateDepense')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/search`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Recherche de dépenses'))
        );
    }

    /**
     * Filtrer les dépenses avec critères avancés
     */
    filterExpenses(filter: ExpenseSearchFilter): Observable<ExpenseListResponse> {
        this.logger.info('Filtrage avancé des dépenses', filter);

        return this.http.post<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/filter`, filter).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Filtrage des dépenses'))
        );
    }

    /**
     * Dépenses par catégorie
     */
    getExpensesByCategory(categorieId: number, page = 0, size = 20): Observable<ExpenseListResponse> {
        this.logger.info(`Dépenses par catégorie ${categorieId}`);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/category/${categorieId}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Dépenses par catégorie'))
        );
    }

    /**
     * Dépenses par fournisseur
     */
    getExpensesBySupplier(fournisseurId: number, page = 0, size = 20): Observable<ExpenseListResponse> {
        this.logger.info(`Dépenses par fournisseur ${fournisseurId}`);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/supplier/${fournisseurId}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Dépenses par fournisseur'))
        );
    }

    /**
     * Dépenses par statut
     */
    getExpensesByStatus(statut: ExpenseStatus, page = 0, size = 20): Observable<ExpenseListResponse> {
        this.logger.info(`Dépenses par statut ${statut}`);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/status/${statut}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Dépenses par statut'))
        );
    }

    /**
     * Réinitialiser la recherche
     */
    resetSearch(page = 0, size = 20): Observable<ExpenseListResponse> {
        this.logger.info('Réinitialisation de la recherche');

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.post<ApiResponse<ExpensePageResponse>>(`${this.apiUrl}/reset-search`, {}, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Réinitialisation de la recherche'))
        );
    }

    // ========== Gestion des statuts ==========

    /**
     * Changer le statut d'une dépense
     */
    changeExpenseStatus(id: number, request: ExpenseStatusChangeRequest): Observable<Expense> {
        this.logger.info(`Changement de statut de la dépense ${id}`, request);

        return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${id}/status`, request).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Changement de statut'))
        );
    }

    /**
     * Approuver une dépense
     */
    approveExpense(id: number, commentaire?: string): Observable<Expense> {
        this.logger.info(`Approbation de la dépense ${id}`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<Expense>>(`${this.apiUrl}/${id}/approve`, {}, { params }).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Approbation de la dépense'))
        );
    }

    /**
     * Rejeter une dépense
     */
    rejectExpense(id: number, commentaire: string): Observable<Expense> {
        this.logger.info(`Rejet de la dépense ${id}`);

        let params = new HttpParams().set('commentaire', commentaire);

        return this.http.patch<ApiResponse<Expense>>(`${this.apiUrl}/${id}/reject`, {}, { params }).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Rejet de la dépense'))
        );
    }

    /**
     * Marquer comme payée
     */
    markExpenseAsPaid(id: number, commentaire?: string): Observable<Expense> {
        this.logger.info(`Marquage comme payée de la dépense ${id}`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<Expense>>(`${this.apiUrl}/${id}/mark-paid`, {}, { params }).pipe(
            map(response => this.mapExpenseResponse(response.data)),
            catchError(err => this.handleError(err, 'Marquage comme payée'))
        );
    }

    /**
     * Dépenses en attente
     */
    getPendingExpenses(): Observable<Expense[]> {
        this.logger.info('Récupération des dépenses en attente');

        return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/pending`).pipe(
            map(response => response.data.map(expense => this.mapExpenseResponse(expense))),
            catchError(err => this.handleError(err, 'Dépenses en attente'))
        );
    }

    /**
     * Dépenses récentes
     */
    getRecentExpenses(limit = 10): Observable<Expense[]> {
        this.logger.info(`Récupération des ${limit} dépenses récentes`);

        let params = new HttpParams().set('limit', limit.toString());

        return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/recent`, { params }).pipe(
            map(response => response.data.map(expense => this.mapExpenseResponse(expense))),
            catchError(err => this.handleError(err, 'Dépenses récentes'))
        );
    }

    // ========== Statistiques ==========

    /**
     * Statistiques des dépenses
     */
    getExpenseStatistics(): Observable<ExpenseStatsResponse> {
        this.logger.info('Récupération des statistiques des dépenses');

        return this.http.get<ApiResponse<ExpenseStatsResponse>>(`${this.apiUrl}/stats`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Statistiques des dépenses'))
        );
    }

    // ========== Export ==========

    /**
     * Export PDF
     */
    exportToPdf(filter?: ExpenseSearchFilter): Observable<Blob> {
        this.logger.info('Export PDF des dépenses');

        const searchFilter = filter || {};

        return this.http.post(`${this.apiUrl}/export/pdf`, searchFilter, {
            responseType: 'blob',
            observe: 'body'
        }).pipe(
            catchError(err => this.handleError(err, 'Export PDF'))
        );
    }

    /**
     * Export Excel
     */
    exportToExcel(filter?: ExpenseSearchFilter): Observable<Blob> {
        this.logger.info('Export Excel des dépenses');

        const searchFilter = filter || {};

        return this.http.post(`${this.apiUrl}/export/excel`, searchFilter, {
            responseType: 'blob',
            observe: 'body'
        }).pipe(
            catchError(err => this.handleError(err, 'Export Excel'))
        );
    }

    // ========== Utilitaires ==========

    /**
     * Vérifier l'unicité du numéro
     */
    checkNumeroExists(numero: string, excludeId?: number): Observable<boolean> {
        this.logger.info(`Vérification de l'existence du numéro ${numero}`);

        let params = new HttpParams();
        if (excludeId) {
            params = params.set('excludeId', excludeId.toString());
        }

        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/numero/${numero}`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Vérification du numéro'))
        );
    }

    /**
     * Générer un numéro automatique
     */
    generateNumero(): Observable<string> {
        this.logger.info('Génération d\'un nouveau numéro');

        return this.http.get<ApiResponse<string>>(`${this.apiUrl}/generate-numero`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Génération du numéro'))
        );
    }

    // ========== Méthodes privées ==========

    private mapToSearchFilter(filter?: ExpenseListFilter): ExpenseSearchFilter {
        if (!filter) return {};

        const searchFilter: ExpenseSearchFilter = {
            page: filter.page || 0,
            size: filter.size || environment.defaultPageSize,
            sortBy: 'dateDepense',
            sortDirection: 'desc'
        };

        if (filter.search) searchFilter.search = filter.search;
        if (filter.categorieId) searchFilter.categorieId = filter.categorieId;
        if (filter.fournisseurId) searchFilter.fournisseurId = filter.fournisseurId;
        if (filter.statut) searchFilter.statut = filter.statut;
        if (filter.paymentMethodId) searchFilter.paymentMethodId = filter.paymentMethodId;
        if (filter.montantMin) searchFilter.minAmount = filter.montantMin;
        if (filter.montantMax) searchFilter.maxAmount = filter.montantMax;
        if (filter.dateDebut) searchFilter.startDate = filter.dateDebut;
        if (filter.dateFin) searchFilter.endDate = filter.dateFin;
        if (filter.mois) searchFilter.month = filter.mois;
        if (filter.annee) searchFilter.year = filter.annee;

        return searchFilter;
    }

    private buildHttpParams(filter: ExpenseSearchFilter): HttpParams {
        let params = new HttpParams()
            .set('page', (filter.page || 0).toString())
            .set('size', (filter.size || environment.defaultPageSize).toString())
            .set('sortBy', filter.sortBy || 'dateDepense')
            .set('sortDirection', filter.sortDirection || 'desc');

        if (filter.search) params = params.set('search', filter.search);
        if (filter.categorieId) params = params.set('categorieId', filter.categorieId.toString());
        if (filter.fournisseurId) params = params.set('fournisseurId', filter.fournisseurId.toString());
        if (filter.statut) params = params.set('statut', filter.statut);
        if (filter.paymentMethodId) params = params.set('paymentMethodId', filter.paymentMethodId.toString());
        if (filter.minAmount) params = params.set('minAmount', filter.minAmount.toString());
        if (filter.maxAmount) params = params.set('maxAmount', filter.maxAmount.toString());
        if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString().split('T')[0]);
        if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString().split('T')[0]);
        if (filter.year) params = params.set('year', filter.year.toString());
        if (filter.month) params = params.set('month', filter.month.toString());
        if (filter.day) params = params.set('day', filter.day.toString());
        if (filter.active !== undefined) params = params.set('active', filter.active.toString());

        return params;
    }

    private mapExpenseResponse(expense: any): Expense {
        return {
            ...expense,
            dateDepense: new Date(expense.dateDepense),
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt)
        };
    }

    private mapPageResponse(pageResponse: ExpensePageResponse): ExpenseListResponse {
        return {
            expenses: pageResponse.expenses.map(expense => this.mapExpenseResponse(expense)),
            total: pageResponse.total,
            page: pageResponse.page,
            size: pageResponse.size
        };
    }

    private handleError(error: any, context: string) {
        const message = error?.error?.message || error.message || 'Erreur inconnue';
        this.logger.error(`${context} - ${message}`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => new Error(message));
    }
}
