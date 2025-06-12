import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
    PaymentMethod,
    PaymentMethodCreate,
    PaymentMethodFilter,
    PaymentMethodListResponse,
    PaymentMethodUpdate
} from '../interfaces/payment-method.interface';


@Injectable({
    providedIn: 'root'
})
export class PaymentMethodService {
    private readonly baseUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/payment-methods`;

    constructor(private http: HttpClient,
                private readonly logger: LoggerService,
                private readonly errorHandler: ErrorHandlerService) {}

    /**
     * Récupère toutes les fournisseurs avec pagination
     */
    getPaymentMethods(filter: PaymentMethodFilter = {}): Observable<ApiResponse<PaymentMethodListResponse>> {
        let params = new HttpParams();

        if (filter.query) params = params.set('query', filter.query);
        if (filter.active !== undefined) params = params.set('active', filter.active.toString());
        if (filter.page !== undefined) params = params.set('page', filter.page.toString());
        if (filter.size !== undefined) params = params.set('size', filter.size.toString());
        if (filter.sort) params = params.set('sort', filter.sort);
        if (filter.direction) params = params.set('direction', filter.direction);


        return this.http.get<ApiResponse<PaymentMethodListResponse>>(`${this.baseUrl}`, { params }).pipe(
            catchError(err => this.handleError(err, 'Chargement des fournisseurs'))
        );
    }

    /**
     * Récupère toutes les fournisseurs actives (pour les dropdowns)
     */
    getActivePaymentMethods(): Observable<PaymentMethod[]> {
        return this.http.get<ApiResponse<PaymentMethod[]>>(`${this.baseUrl}/active`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une fournisseur par son ID
     */
    getPaymentMethodById(id: number): Observable<PaymentMethod> {
        return this.http.get<ApiResponse<PaymentMethod>>(`${this.baseUrl}/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Récupère une fournisseur par son code
     */
    getPaymentMethodByCode(code: string): Observable<PaymentMethod> {
        return this.http.get<ApiResponse<PaymentMethod>>(`${this.baseUrl}/code/${code}`)
            .pipe(map(response => response.data));
    }

    /**
     * Crée une nouvelle fournisseur
     */
    createPaymentMethod(supplier: PaymentMethodCreate): Observable<PaymentMethod> {
        return this.http.post<ApiResponse<PaymentMethod>>(this.baseUrl, supplier)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Met à jour une fournisseur
     */
    updatePaymentMethod(id: number, supplier: PaymentMethodUpdate): Observable<PaymentMethod> {
        return this.http.put<ApiResponse<PaymentMethod>>(`${this.baseUrl}/${id}`, supplier)
            .pipe(
                map(response => response.data),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Supprime une fournisseur (logique)
     */
    deletePaymentMethod(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Supprime définitivement une fournisseur
     */
    permanentDeletePaymentMethod(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
            .pipe(
                map(() => void 0),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Restaure une fournisseur supprimée
     */
    restorePaymentMethod(id: number): Observable<PaymentMethod> {
        return this.http.patch<ApiResponse<PaymentMethod>>(`${this.baseUrl}/${id}/restore`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Recherche des fournisseurs
     */
    searchPaymentMethods(query: string, filter: PaymentMethodFilter = {}): Observable<ApiResponse<PaymentMethodListResponse>> {
        return this.getPaymentMethods({ ...filter, query: query });
    }

    /**
     * Bascule le statut actif/inactif d'une fournisseur
     */
    togglePaymentMethodStatus(id: number): Observable<PaymentMethod> {
        return this.http.patch<ApiResponse<PaymentMethod>>(`${this.baseUrl}/${id}/toggle-status`, {})
            .pipe(
                map(response => response.data),
                tap(() => this.refreshPaymentMethods())
            );
    }

    /**
     * Vérifie si une fournisseur existe (par nom ou code)
     */
    checkPaymentMethodExists(nom?: string, code?: string): Observable<boolean> {
        let params = new HttpParams();
        if (nom) params = params.set('nom', nom);
        if (code) params = params.set('code', code);

        return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/exists`, { params })
            .pipe(map(response => response.data));
    }

    /**
     * Récupère les statistiques des fournisseurs
     */
    getPaymentMethodStats(): Observable<any> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`)
            .pipe(map(response => response.data));
    }

    /**
     * Rafraîchit la liste des fournisseurs
     */
    private refreshPaymentMethods(): void {
        // Récupère la première page pour mettre à jour le cache
        this.getPaymentMethods({ page: 0, size: 20 }).subscribe();
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
