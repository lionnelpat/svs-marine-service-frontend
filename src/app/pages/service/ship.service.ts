// pages/service/ship.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    CreateShipRequest,
    DropdownListResponse,
    Ship,
    ShipListFilter,
    ShipListResponse,
    UpdateShipRequest
} from '../../shared/models/ship.model';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShipService {
    private readonly apiBaseUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/ships`;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}



    getActiveShips(filter: ShipListFilter = {}): Observable<ShipListResponse> {
        let params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', 'nom')
            .set('sortDirection', 'asc');

        return this.http.get<any>(`${this.apiBaseUrl}/active`, { params }).pipe(
            map(response => ({
                ships: response,
                total: response.total,
                page: response.page,
                size: response.size
            })),
            catchError(err => this.handleError(err, 'Chargement des navires actifs'))
        );
    }


    getShips(filter: ShipListFilter = {}): Observable<ShipListResponse> {
        this.logger.info('Appel API - Liste des navires', filter);

        let params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', 'nom')
            .set('sortDirection', 'asc');

        if (filter.search) {
            params = params.set('search', filter.search);
        }

        if (filter.pavillon) {
            params = params.set('pavillon', filter.pavillon);
        }

        if (filter.compagnieId) {
            params = params.set('compagnieId', filter.compagnieId.toString());
        }

        if (filter.typeNavire) {
            params = params.set('typeNavire', filter.typeNavire);
        }

        if (filter.active !== undefined) {
            params = params.set('active', filter.active.toString());
        }

        return this.http.get<any>(this.apiBaseUrl, { params }).pipe(
            map(response => ({
                ships: response.ships,
                total: response.total,
                page: response.page,
                size: response.size
            })),
            catchError(err => this.handleError(err, 'Chargement des navires'))
        );
    }

    getShipById(id: number): Observable<Ship> {
        return this.http.get<Ship>(`${this.apiBaseUrl}/${id}`).pipe(
            catchError(err => this.handleError(err, `Chargement navire ID: ${id}`))
        );
    }

    createShip(request: CreateShipRequest): Observable<Ship> {
        return this.http.post<Ship>(this.apiBaseUrl, request).pipe(
            catchError(err => this.handleError(err, 'Création navire'))
        );
    }

    updateShip(request: UpdateShipRequest): Observable<Ship> {
        return this.http.put<Ship>(`${this.apiBaseUrl}/${request.id}`, request).pipe(
            catchError(err => this.handleError(err, `Mise à jour navire ID: ${request.id}`))
        );
    }

    deleteShip(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiBaseUrl}/${id}`).pipe(
            map(() => true),
            catchError(err => this.handleError(err, `Suppression navire ID: ${id}`))
        );
    }

    toggleShipStatus(id: number): Observable<Ship> {
        return this.http.patch<Ship>(`${this.apiBaseUrl}/${id}/toggle-status`, {}).pipe(
            catchError(err => this.handleError(err, `Changement de statut navire ID: ${id}`))
        );
    }

    getShipsByCompany(compagnieId: number): Observable<Ship[]> {
        return this.http.get<Ship[]>(`${this.apiBaseUrl}/by-company/${compagnieId}`).pipe(
            catchError(err => this.handleError(err, `Récupération navires de la compagnie ${compagnieId}`))
        );
    }

    getShipStatistics(): Observable<any> {
        return this.http.get<any>(`${this.apiBaseUrl}/statistics`).pipe(
            catchError(err => this.handleError(err, 'Récupération statistiques navires'))
        );
    }

    private handleError(error: any, context: string) {
        this.logger.error(`${context} - Erreur`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => error);
    }

    getShipTypes(): Observable<DropdownListResponse[]> {
        return this.http.get<Record<string, string>>(`${this.apiBaseUrl}/types`).pipe(
            map(response => {
                const options: DropdownListResponse[] = Object.entries(response).map(
                    ([value, label]) => ({ label, value })
                );
                this.logger.debug('Types de navires chargés', options);
                return options;
            }),
            catchError(error => this.handleError(error, 'Chargement des types de navires'))
        );
    }

    getClassifications(): Observable<DropdownListResponse[]>  {
        return this.http.get<Record<string, string>>(`${this.apiBaseUrl}/classifications`).pipe(
            map(response => {
                const options: DropdownListResponse[] = Object.entries(response).map(
                    ([value, label]) => ({ label, value })
                );
                this.logger.debug('Classifications chargés', options);
                return options;
            }),
            catchError(error => this.handleError(error, 'Chargement des classifications de navires'))
        );
    }

    getFlag(): Observable<DropdownListResponse[]>  {
        return this.http.get<Record<string, string>>(`${this.apiBaseUrl}/flags`).pipe(
            map(response => {
                const options: DropdownListResponse[] = Object.entries(response).map(
                    ([value, label]) => ({ label, value })
                );
                this.logger.debug('Flag de navires chargés', options);
                return options;
            }),
            catchError(error => this.handleError(error, 'Chargement des flags de navires'))
        );
    }
}
