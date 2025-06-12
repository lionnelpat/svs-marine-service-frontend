import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
    ExpenseSupplier,
    ExpenseSupplierCreate,
    ExpenseSupplierListFilter,
    ExpenseSupplierListResponse,
    ExpenseSupplierUpdate
} from '../interfaces/expense-supplier.interface';


@Injectable({
    providedIn: 'root'
})
export class ExpenseSupplierService {
    private readonly baseUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/expense-suppliers`;

    constructor(private http: HttpClient,
                private readonly logger: LoggerService,
                private readonly errorHandler: ErrorHandlerService) {}

    /**
     * Récupère toutes les fournisseurs avec pagination
     */
    getSuppliers(filter: ExpenseSupplierListFilter = {}): Observable<ApiResponse<ExpenseSupplierListResponse>> {
        let params = new HttpParams();

        if (filter.search) params = params.set('query', filter.search);
        if (filter.active !== undefined) params = params.set('active', filter.active.toString());
        if (filter.page !== undefined) params = params.set('page', filter.page.toString());
        if (filter.size !== undefined) params = params.set('size', filter.size.toString());
        if (filter.sortBy) params = params.set('sort', filter.sortBy);
        if (filter.sortDirection) params = params.set('direction', filter.sortDirection);


        return this.http.get<ApiResponse<ExpenseSupplierListResponse>>(`${this.baseUrl}`, { params }).pipe(
            catchError(err => this.handleError(err, 'Chargement des fournisseurs'))
        );
    }

    /**
     * Récupère toutes les fournisseurs actives (pour les dropdowns)
     */
    getActiveSuppliers(): Observable<ExpenseSupplier[]> {
        return this.http.get<ApiResponse<ExpenseSupplier[]>>(`${this.baseUrl}/active`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une fournisseur par son ID
     */
    getSupplierById(id: number): Observable<ExpenseSupplier> {
        return this.http.get<ApiResponse<ExpenseSupplier>>(`${this.baseUrl}/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une fournisseur par son code
     */
    getSupplierByCode(code: string): Observable<ExpenseSupplier> {
        return this.http.get<ApiResponse<ExpenseSupplier>>(`${this.baseUrl}/code/${code}`)
            .pipe(map(response => response.data));
    }

    /**
     * Crée une nouvelle fournisseur
     */
    createSupplier(supplier: ExpenseSupplierCreate): Observable<ExpenseSupplier> {
        return this.http.post<ApiResponse<ExpenseSupplier>>(this.baseUrl, supplier)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Met à jour une fournisseur
     */
    updateSupplier(id: number, supplier: ExpenseSupplierUpdate): Observable<ExpenseSupplier> {
        return this.http.put<ApiResponse<ExpenseSupplier>>(`${this.baseUrl}/${id}`, supplier)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Supprime une fournisseur (logique)
     */
    deleteSupplier(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Supprime définitivement une fournisseur
     */
    permanentDeleteSupplier(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}/permanent`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Restaure une fournisseur supprimée
     */
    restoreSupplier(id: number): Observable<ExpenseSupplier> {
        return this.http.patch<ApiResponse<ExpenseSupplier>>(`${this.baseUrl}/${id}/restore`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Recherche des fournisseurs
     */
    searchSuppliers(query: string, filter: ExpenseSupplierListFilter = {}): Observable<ApiResponse<ExpenseSupplierListResponse>> {
        return this.getSuppliers({ ...filter, search: query });
    }

    /**
     * Bascule le statut actif/inactif d'une fournisseur
     */
    toggleSupplierStatus(id: number): Observable<ExpenseSupplier> {
        return this.http.patch<ApiResponse<ExpenseSupplier>>(`${this.baseUrl}/${id}/toggle-status`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshSuppliers())
            );
    }

    /**
     * Vérifie si une fournisseur existe (par nom ou code)
     */
    checkSupplierExists(nom?: string, code?: string): Observable<boolean> {
        let params = new HttpParams();
        if (nom) params = params.set('nom', nom);
        if (code) params = params.set('code', code);

        return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/exists`, { params })
            .pipe(map(response => response.data));
    }

    /**
     * Récupère les statistiques des fournisseurs
     */
    getSupplierStats(): Observable<any> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`)
            .pipe(map(response => response.data));
    }

    /**
     * Rafraîchit la liste des fournisseurs
     */
    private refreshSuppliers(): void {
        // Récupère la première page pour mettre à jour le cache
        this.getSuppliers({ page: 0, size: 20 }).subscribe();
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
