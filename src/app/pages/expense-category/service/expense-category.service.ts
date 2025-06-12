import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
    ExpenseCategory,
    ExpenseCategoryCreate,
    ExpenseCategoryListFilter,
    ExpenseCategoryListResponse,
    ExpenseCategoryUpdate
} from '../../../shared/models/expense-category.model';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';


@Injectable({
    providedIn: 'root'
})
export class ExpenseCategoryService {
    private readonly baseUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/expense-categories`;

    // State management
    private readonly categoriesSubject = new BehaviorSubject<ExpenseCategory[]>([]);
    private readonly loadingSubject = new BehaviorSubject<boolean>(false);
    private readonly totalSubject = new BehaviorSubject<number>(0);

    constructor(private http: HttpClient,
                private readonly logger: LoggerService,
                private readonly errorHandler: ErrorHandlerService) {}

    /**
     * Récupère toutes les catégories avec pagination
     */
    getCategories(filter: ExpenseCategoryListFilter = {}): Observable<ApiResponse<ExpenseCategoryListResponse>> {
        let params = new HttpParams();

        if (filter.search) params = params.set('query', filter.search);
        if (filter.active !== undefined) params = params.set('active', filter.active.toString());
        if (filter.page !== undefined) params = params.set('page', filter.page.toString());
        if (filter.size !== undefined) params = params.set('size', filter.size.toString());
        if (filter.sortBy) params = params.set('sort', filter.sortBy);
        if (filter.sortDirection) params = params.set('direction', filter.sortDirection);

        this.loadingSubject.next(true);

        return this.http.get<ApiResponse<ExpenseCategoryListResponse>>(`${this.baseUrl}`, { params }).pipe(
            catchError(err => this.handleError(err, 'Chargement des catégories'))
        );
    }

    /**
     * Récupère toutes les catégories actives (pour les dropdowns)
     */
    getActiveCategories(): Observable<ExpenseCategory[]> {
        return this.http.get<ApiResponse<ExpenseCategory[]>>(`${this.baseUrl}/active`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une catégorie par son ID
     */
    getCategoryById(id: number): Observable<ExpenseCategory> {
        return this.http.get<ApiResponse<ExpenseCategory>>(`${this.baseUrl}/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une catégorie par son code
     */
    getCategoryByCode(code: string): Observable<ExpenseCategory> {
        return this.http.get<ApiResponse<ExpenseCategory>>(`${this.baseUrl}/code/${code}`)
            .pipe(map(response => response.data));
    }

    /**
     * Crée une nouvelle catégorie
     */
    createCategory(category: ExpenseCategoryCreate): Observable<ExpenseCategory> {
        return this.http.post<ApiResponse<ExpenseCategory>>(this.baseUrl, category)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Met à jour une catégorie
     */
    updateCategory(id: number, category: ExpenseCategoryUpdate): Observable<ExpenseCategory> {
        return this.http.put<ApiResponse<ExpenseCategory>>(`${this.baseUrl}/${id}`, category)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Supprime une catégorie (logique)
     */
    deleteCategory(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Supprime définitivement une catégorie
     */
    permanentDeleteCategory(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}/permanent`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Restaure une catégorie supprimée
     */
    restoreCategory(id: number): Observable<ExpenseCategory> {
        return this.http.patch<ApiResponse<ExpenseCategory>>(`${this.baseUrl}/${id}/restore`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Recherche des catégories
     */
    searchCategories(query: string, filter: ExpenseCategoryListFilter = {}): Observable<ApiResponse<ExpenseCategoryListResponse>> {
        return this.getCategories({ ...filter, search: query });
    }

    /**
     * Bascule le statut actif/inactif d'une catégorie
     */
    toggleCategoryStatus(id: number): Observable<ExpenseCategory> {
        return this.http.patch<ApiResponse<ExpenseCategory>>(`${this.baseUrl}/${id}/toggle-status`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshCategories())
            );
    }

    /**
     * Vérifie si une catégorie existe (par nom ou code)
     */
    checkCategoryExists(nom?: string, code?: string): Observable<boolean> {
        let params = new HttpParams();
        if (nom) params = params.set('nom', nom);
        if (code) params = params.set('code', code);

        return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/exists`, { params })
            .pipe(map(response => response.data));
    }

    /**
     * Récupère les statistiques des catégories
     */
    getCategoryStats(): Observable<any> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`)
            .pipe(map(response => response.data));
    }

    /**
     * Rafraîchit la liste des catégories
     */
    private refreshCategories(): void {
        // Récupère la première page pour mettre à jour le cache
        this.getCategories({ page: 0, size: 20 }).subscribe();
    }

    /**
     * Vide le cache
     */
    clearCache(): void {
        this.categoriesSubject.next([]);
        this.totalSubject.next(0);
    }

    /**
     * Gestion des erreurs
     */
    // --- Gestion d’erreur centralisée ---
    private handleError(error: any, context: string) {
        const message = error?.error?.message || error.message || 'Erreur inconnue';
        this.logger.error(`${context} - ${message}`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => new Error(message));
    }
}
