import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
    Invoice,
    InvoiceListFilter,
    InvoiceListResponse,
    InvoiceStatistics,
    InvoiceStatus,
    InvoicePrintData, CreateInvoiceRequest, UpdateInvoiceRequest, InvoicePageResponse, InvoiceSearchFilter
} from '../../shared/models/invoice.model';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ApiResponse } from '../../core/interfaces/api-response.interface';

/**
 * Service de gestion des factures de prestations maritimes
 * SVS - Dakar, Sénégal
 */
@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private readonly apiUrl = `${environment.apiBaseUrl}/${environment.apiVersion}/invoices`;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {
        this.logger.info('InvoiceService initialisé');
    }

    // ========== CRUD de base ==========

    /**
     * Créer une nouvelle facture
     */
    createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
        this.logger.info('Création d\'une nouvelle facture', request);

        return this.http.post<ApiResponse<Invoice>>(`${this.apiUrl}`, request).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Création de la facture'))
        );
    }

    /**
     * Mettre à jour une facture
     */
    updateInvoice(id: number, request: UpdateInvoiceRequest): Observable<Invoice> {
        this.logger.info(`Mise à jour de la facture ${id}`, request);

        return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, request).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Mise à jour de la facture'))
        );
    }

    /**
     * Récupérer une facture par ID
     */
    getInvoiceById(id: number): Observable<Invoice> {
        this.logger.info(`Récupération de la facture ${id}`);

        return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Récupération de la facture'))
        );
    }

    /**
     * Récupérer une facture par numéro
     */
    getInvoiceByNumero(numero: string): Observable<Invoice> {
        this.logger.info(`Récupération de la facture par numéro ${numero}`);

        return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/numero/${numero}`).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Récupération de la facture'))
        );
    }

    /**
     * Supprimer une facture
     */
    deleteInvoice(id: number): Observable<void> {
        this.logger.info(`Suppression de la facture ${id}`);

        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
            map(() => void 0),
            catchError(err => this.handleError(err, 'Suppression de la facture'))
        );
    }

    // ========== Recherche et filtres ==========

    /**
     * Récupérer les factures avec filtres et pagination
     */
    getInvoices(filter?: InvoiceListFilter): Observable<InvoiceListResponse> {
        this.logger.info('Récupération des factures avec filtres', filter);

        const searchFilter = this.mapToSearchFilter(filter);
        let params = this.buildHttpParams(searchFilter);

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Récupération des factures'))
        );
    }

    /**
     * Recherche textuelle dans les factures
     */
    searchInvoices(query: string, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Recherche textuelle: "${query}"`);

        let params = new HttpParams()
            .set('search', query)
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Recherche de factures'))
        );
    }

    /**
     * Filtrer les factures avec critères avancés
     */
    filterInvoices(filter: InvoiceSearchFilter): Observable<InvoiceListResponse> {
        this.logger.info('Filtrage avancé des factures', filter);

        let params = this.buildHttpParams(filter);

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Filtrage des factures'))
        );
    }

    /**
     * Factures par compagnie
     */
    getInvoicesByCompany(compagnieId: number, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Factures par compagnie ${compagnieId}`);

        let params = new HttpParams()
            .set('compagnieId', compagnieId.toString())
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Factures par compagnie'))
        );
    }

    /**
     * Factures par navire
     */
    getInvoicesByShip(navireId: number, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Factures par navire ${navireId}`);

        let params = new HttpParams()
            .set('navireId', navireId.toString())
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Factures par navire'))
        );
    }

    /**
     * Factures par statut
     */
    getInvoicesByStatus(statut: InvoiceStatus, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Factures par statut ${statut}`);

        let params = new HttpParams()
            .set('statut', statut)
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Factures par statut'))
        );
    }

    /**
     * Factures par période (mois/année)
     */
    getInvoicesByPeriod(annee: number, mois?: number, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Factures par période ${mois}/${annee}`);

        let params = new HttpParams()
            .set('annee', annee.toString())
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        if (mois) {
            params = params.set('mois', mois.toString());
        }

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Factures par période'))
        );
    }

    /**
     * Factures par plage de dates
     */
    getInvoicesByDateRange(startDate: Date, endDate: Date, page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info(`Factures par plage de dates: ${startDate} - ${endDate}`);

        let params = new HttpParams()
            .set('dateDebut', this.formatDate(startDate))
            .set('dateFin', this.formatDate(endDate))
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Factures par plage de dates'))
        );
    }

    /**
     * Réinitialiser la recherche
     */
    resetSearch(page = 0, size = 20): Observable<InvoiceListResponse> {
        this.logger.info('Réinitialisation de la recherche');

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', 'dateFacture')
            .set('sortDirection', 'desc');

        return this.http.get<ApiResponse<InvoicePageResponse>>(`${this.apiUrl}`, { params }).pipe(
            map(response => this.mapPageResponse(response.data)),
            catchError(err => this.handleError(err, 'Réinitialisation de la recherche'))
        );
    }

    // ========== Factures spécialisées ==========

    /**
     * Factures récentes
     */
    getRecentInvoices(limit = 10): Observable<Invoice[]> {
        this.logger.info(`Récupération des ${limit} factures récentes`);

        let params = new HttpParams().set('limit', limit.toString());

        return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}/recent`, { params }).pipe(
            map(response => response.data.map(invoice => this.mapInvoiceResponse(invoice))),
            catchError(err => this.handleError(err, 'Factures récentes'))
        );
    }

    /**
     * Factures en attente (brouillon)
     */
    getPendingInvoices(): Observable<Invoice[]> {
        this.logger.info('Récupération des factures en attente');

        return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}/pending`).pipe(
            map(response => response.data.map(invoice => this.mapInvoiceResponse(invoice))),
            catchError(err => this.handleError(err, 'Factures en attente'))
        );
    }

    /**
     * Factures échues (en retard)
     */
    getOverdueInvoices(): Observable<Invoice[]> {
        this.logger.info('Récupération des factures échues');

        return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}/overdue`).pipe(
            map(response => response.data.map(invoice => this.mapInvoiceResponse(invoice))),
            catchError(err => this.handleError(err, 'Factures échues'))
        );
    }

    // ========== Gestion des statuts ==========

    /**
     * Changer le statut d'une facture
     */
    changeInvoiceStatus(id: number, statut: InvoiceStatus, commentaire?: string): Observable<Invoice> {
        this.logger.info(`Changement statut facture ${id} vers ${statut}`);

        let params = new HttpParams().set('statut', statut);
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/status`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Changement de statut'))
        );
    }

    /**
     * Émettre une facture (BROUILLON → EMISE)
     */
    emitInvoice(id: number, commentaire?: string): Observable<Invoice> {
        this.logger.info(`Émission de la facture ${id}`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/emit`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Émission de la facture'))
        );
    }

    /**
     * Marquer comme payée
     */
    markInvoiceAsPaid(id: number, commentaire?: string): Observable<Invoice> {
        this.logger.info(`Marquage payée facture ${id}`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/mark-paid`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Marquage comme payée'))
        );
    }

    /**
     * Annuler une facture
     */
    cancelInvoice(id: number, commentaire: string): Observable<Invoice> {
        this.logger.info(`Annulation de la facture ${id}`);

        let params = new HttpParams().set('commentaire', commentaire);

        return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/cancel`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Annulation de la facture'))
        );
    }

    /**
     * Remettre en brouillon
     */
    markInvoiceAsDraft(id: number, commentaire?: string): Observable<Invoice> {
        this.logger.info(`Remise en brouillon facture ${id}`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/mark-draft`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Remise en brouillon'))
        );
    }

    /**
     * Mettre à jour les factures en retard
     */
    updateOverdueInvoices(): Observable<number> {
        this.logger.info('Mise à jour des factures en retard');

        return this.http.patch<ApiResponse<number>>(`${this.apiUrl}/update-overdue`, {}).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Mise à jour factures en retard'))
        );
    }

    /**
     * Activer/Désactiver une facture
     */
    toggleInvoiceActive(id: number, active: boolean): Observable<Invoice> {
        this.logger.info(`Basculement statut actif facture ${id} vers ${active}`);

        let params = new HttpParams().set('active', active.toString());

        return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/toggle-active`, {}, { params }).pipe(
            map(response => this.mapInvoiceResponse(response.data)),
            catchError(err => this.handleError(err, 'Basculement statut actif'))
        );
    }

    // ========== Statistiques ==========

    /**
     * Statistiques générales des factures
     */
    getInvoiceStatistics(): Observable<InvoiceStatistics> {
        this.logger.info('Récupération des statistiques des factures');

        return this.http.get<ApiResponse<InvoiceStatistics>>(`${this.apiUrl}/stats`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Statistiques des factures'))
        );
    }

    /**
     * Statistiques pour une période
     */
    getInvoiceStatisticsForPeriod(startDate: Date, endDate: Date): Observable<InvoiceStatistics> {
        this.logger.info(`Statistiques période: ${startDate} - ${endDate}`);

        let params = new HttpParams()
            .set('startDate', this.formatDate(startDate))
            .set('endDate', this.formatDate(endDate));

        return this.http.get<ApiResponse<InvoiceStatistics>>(`${this.apiUrl}/stats/period`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Statistiques par période'))
        );
    }

    /**
     * Top compagnies par chiffre d'affaires
     */
    getTopCompanies(limit = 10, startDate?: Date): Observable<any[]> {
        this.logger.info(`Top ${limit} compagnies`);

        let params = new HttpParams().set('limit', limit.toString());
        if (startDate) {
            params = params.set('startDate', this.formatDate(startDate));
        }

        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/stats/top-companies`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Top compagnies'))
        );
    }

    /**
     * Évolution mensuelle
     */
    getMonthlyEvolution(months = 12): Observable<any[]> {
        this.logger.info(`Évolution mensuelle sur ${months} mois`);

        let params = new HttpParams().set('months', months.toString());

        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/stats/monthly-evolution`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Évolution mensuelle'))
        );
    }

    /**
     * Données du dashboard
     */
    getDashboardData(): Observable<any> {
        this.logger.info('Récupération des données du dashboard');

        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard`).pipe(
            map(response => ({
                ...response.data,
                recentInvoices: response.data.recentInvoices?.map((invoice: any) => this.mapInvoiceResponse(invoice)),
                pendingInvoices: response.data.pendingInvoices?.map((invoice: any) => this.mapInvoiceResponse(invoice)),
                overdueInvoices: response.data.overdueInvoices?.map((invoice: any) => this.mapInvoiceResponse(invoice))
            })),
            catchError(err => this.handleError(err, 'Données du dashboard'))
        );
    }

    /**
     * Chiffre d'affaires pour une période
     */
    getRevenueForPeriod(startDate: Date, endDate: Date): Observable<number> {
        this.logger.info(`Calcul CA période: ${startDate} - ${endDate}`);

        let params = new HttpParams()
            .set('startDate', this.formatDate(startDate))
            .set('endDate', this.formatDate(endDate));

        return this.http.get<ApiResponse<number>>(`${this.apiUrl}/revenue`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Calcul du chiffre d\'affaires'))
        );
    }

    // ========== Export et impression ==========

    /**
     * Export PDF liste des factures
     */
    exportToPdf(filter?: InvoiceSearchFilter): Observable<Blob> {
        this.logger.info('Export PDF liste des factures');

        const body = filter || {};

        return this.http.post(`${this.apiUrl}/export/pdf`, body, {
            responseType: 'blob',
            headers: { 'Accept': 'application/pdf' }
        }).pipe(
            catchError(err => this.handleError(err, 'Export PDF'))
        );
    }

    /**
     * Export Excel liste des factures
     */
    exportToExcel(filter?: InvoiceSearchFilter): Observable<Blob> {
        this.logger.info('Export Excel liste des factures');

        const body = filter || {};

        return this.http.post(`${this.apiUrl}/export/excel`, body, {
            responseType: 'blob',
            headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        }).pipe(
            catchError(err => this.handleError(err, 'Export Excel'))
        );
    }

    /**
     * Export PDF facture individuelle
     */
    exportInvoiceToPdf(id: number): Observable<Blob> {
        this.logger.info(`Export PDF facture ${id}`);

        return this.http.get(`${this.apiUrl}/${id}/export/pdf`, {
            responseType: 'blob',
            headers: { 'Accept': 'application/pdf' }
        }).pipe(
            catchError(err => this.handleError(err, 'Export PDF facture'))
        );
    }

    /**
     * Rapport mensuel
     */
    generateMonthlyReport(year: number, month: number): Observable<Blob> {
        this.logger.info(`Génération rapport mensuel ${month}/${year}`);

        let params = new HttpParams()
            .set('year', year.toString())
            .set('month', month.toString());

        return this.http.get(`${this.apiUrl}/reports/monthly`, {
            params,
            responseType: 'blob',
            headers: { 'Accept': 'application/pdf' }
        }).pipe(
            catchError(err => this.handleError(err, 'Rapport mensuel'))
        );
    }

    /**
     * État des comptes clients
     */
    generateAccountStatement(compagnieId?: number, asOfDate?: Date): Observable<Blob> {
        this.logger.info(`État des comptes - Compagnie: ${compagnieId}`);

        let params = new HttpParams();
        if (compagnieId) {
            params = params.set('compagnieId', compagnieId.toString());
        }
        if (asOfDate) {
            params = params.set('asOfDate', this.formatDate(asOfDate));
        }

        return this.http.get(`${this.apiUrl}/reports/account-statement`, {
            params,
            responseType: 'blob',
            headers: { 'Accept': 'application/pdf' }
        }).pipe(
            catchError(err => this.handleError(err, 'État des comptes'))
        );
    }

    /**
     * Données pour impression
     */
    getPrintData(id: number): Observable<InvoicePrintData> {
        this.logger.info(`Données impression facture ${id}`);

        return this.http.get<ApiResponse<InvoicePrintData>>(`${this.apiUrl}/${id}/print-data`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Données d\'impression'))
        );
    }

    // ========== Opérations en lot ==========

    /**
     * Suppression en lot
     */
    deleteBatch(ids: number[]): Observable<number> {
        this.logger.info(`Suppression en lot de ${ids.length} factures`);

        return this.http.delete<ApiResponse<number>>(`${this.apiUrl}/batch`, { body: ids }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Suppression en lot'))
        );
    }

    /**
     * Changement de statut en lot
     */
    changeStatusBatch(ids: number[], statut: InvoiceStatus, commentaire?: string): Observable<number> {
        this.logger.info(`Changement statut en lot: ${ids.length} factures vers ${statut}`);

        let params = new HttpParams().set('statut', statut);
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<number>>(`${this.apiUrl}/batch/status`, ids, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Changement statut en lot'))
        );
    }

    /**
     * Émission en lot
     */
    emitBatch(ids: number[], commentaire?: string): Observable<number> {
        this.logger.info(`Émission en lot de ${ids.length} factures`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<number>>(`${this.apiUrl}/batch/emit`, ids, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Émission en lot'))
        );
    }

    /**
     * Marquage payé en lot
     */
    markAsPaidBatch(ids: number[], commentaire?: string): Observable<number> {
        this.logger.info(`Marquage payé en lot de ${ids.length} factures`);

        let params = new HttpParams();
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }

        return this.http.patch<ApiResponse<number>>(`${this.apiUrl}/batch/mark-paid`, ids, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Marquage payé en lot'))
        );
    }

    // ========== Utilitaires ==========

    /**
     * Vérifier l'existence d'un numéro
     */
    checkNumeroExists(numero: string, excludeId?: number): Observable<boolean> {
        this.logger.info(`Vérification existence numéro: ${numero}`);

        let params = new HttpParams();
        if (excludeId) {
            params = params.set('excludeId', excludeId.toString());
        }

        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/numero/${numero}`, { params }).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Vérification numéro'))
        );
    }

    /**
     * Générer un numéro automatique
     */
    generateNumero(): Observable<string> {
        this.logger.info('Génération nouveau numéro de facture');

        return this.http.get<ApiResponse<string>>(`${this.apiUrl}/generate-numero`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Génération numéro'))
        );
    }

    /**
     * Calculer les montants d'une facture
     */
    calculateAmounts(prestations: any[], tauxTva: number): Observable<any> {
        this.logger.info('Calcul des montants de facture');

        const body = { prestations, tauxTva };

        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/calculate-amounts`, body).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Calcul des montants'))
        );
    }

    /**
     * Vérifier si une facture est modifiable
     */
    isInvoiceEditable(id: number): Observable<boolean> {
        this.logger.info(`Vérification si facture ${id} est modifiable`);

        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${id}/editable`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Vérification modifiable'))
        );
    }

    /**
     * Vérifier si une facture est supprimable
     */
    isInvoiceDeletable(id: number): Observable<boolean> {
        this.logger.info(`Vérification si facture ${id} est supprimable`);

        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${id}/deletable`).pipe(
            map(response => response.data),
            catchError(err => this.handleError(err, 'Vérification supprimable'))
        );
    }

    // ========== Méthodes privées ==========

    /**
     * Mappe la réponse d'une facture en parsant les dates
     */
    private mapInvoiceResponse(invoice: any): Invoice {
        return {
            ...invoice,
            dateFacture: new Date(invoice.dateFacture),
            dateEcheance: new Date(invoice.dateEcheance),
            created_at: new Date(invoice.created_at),
            updated_at: new Date(invoice.updated_at)
        };
    }

    /**
     * Mappe la réponse paginée
     */
    private mapPageResponse(pageResponse: InvoicePageResponse): InvoiceListResponse {
            return {
                invoices: pageResponse.invoices == null ? [] :  pageResponse.invoices.map(invoice => this.mapInvoiceResponse(invoice)),
                total: pageResponse.total,
                page: pageResponse.page,
                size: pageResponse.size
            };


    }

    /**
     * Convertit le filtre de liste en filtre de recherche
     */
    private mapToSearchFilter(filter?: InvoiceListFilter): InvoiceSearchFilter {
        if (!filter) {
            return {};
        }

        return {
            search: filter.search,
            compagnieId: filter.compagnieId,
            navireId: filter.navireId,
            statut: filter.statut,
            dateDebut: filter.dateDebut,
            dateFin: filter.dateFin,
            mois: filter.mois,
            annee: filter.annee,
            active: filter.active,
            page: filter.page,
            size: filter.size
        };
    }

    /**
     * Construit les paramètres HTTP à partir d'un filtre
     */
    private buildHttpParams(filter: any): HttpParams {
        let params = new HttpParams();

        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value !== null && value !== undefined && value !== '') {
                if (value instanceof Date) {
                    params = params.set(key, this.formatDate(value));
                } else {
                    params = params.set(key, value.toString());
                }
            }
        });

        // Paramètres par défaut si non spécifiés
        if (!params.has('page')) {
            params = params.set('page', '0');
        }
        if (!params.has('size')) {
            params = params.set('size', '20');
        }
        if (!params.has('sortBy')) {
            params = params.set('sortBy', 'dateFacture');
        }
        if (!params.has('sortDirection')) {
            params = params.set('sortDirection', 'desc');
        }

        return params;
    }

    /**
     * Formate une date au format ISO (YYYY-MM-DD)
     */
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Gère les erreurs HTTP
     */
    private handleError(error: any, context: string) {
        const message = error?.error?.message || error.message || 'Erreur inconnue';
        this.logger.error(`${context} - ${message}`, error);
        this.errorHandler.handleError(error, context);
        return throwError(() => new Error(message));
    }

    // ========== Méthodes utilitaires pour le frontend ==========

    /**
     * Télécharge un fichier blob avec le nom spécifié
     */
    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Génère un nom de fichier pour l'export
     */
    generateExportFilename(type: 'pdf' | 'excel', prefix = 'factures'): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const extension = type === 'pdf' ? 'pdf' : 'xlsx';
        return `svs-${prefix}-${dateStr}.${extension}`;
    }

    /**
     * Méthode helper pour exporter et télécharger automatiquement
     */
    exportAndDownload(
        exportMethod: () => Observable<Blob>,
        filename: string,
        successMessage: string
    ): Observable<void> {
        return exportMethod().pipe(
            map(blob => {
                this.downloadFile(blob, filename);
                this.logger.info(successMessage);
            }),
            catchError(err => {
                this.logger.error('Erreur lors de l\'export:', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Export PDF liste avec téléchargement automatique
     */
    exportListToPdfAndDownload(filter?: InvoiceSearchFilter): Observable<void> {
        const filename = this.generateExportFilename('pdf', 'liste');
        return this.exportAndDownload(
            () => this.exportToPdf(filter),
            filename,
            'Export PDF de la liste des factures terminé'
        );
    }

    /**
     * Export Excel liste avec téléchargement automatique
     */
    exportListToExcelAndDownload(filter?: InvoiceSearchFilter): Observable<void> {
        const filename = this.generateExportFilename('excel', 'liste');
        return this.exportAndDownload(
            () => this.exportToExcel(filter),
            filename,
            'Export Excel de la liste des factures terminé'
        );
    }

    /**
     * Export PDF facture individuelle avec téléchargement automatique
     */
    exportInvoiceToPdfAndDownload(id: number, invoiceNumber?: string): Observable<void> {
        const filename = invoiceNumber
            ? `svs-facture-${invoiceNumber}.pdf`
            : this.generateExportFilename('pdf', 'facture');

        return this.exportAndDownload(
            () => this.exportInvoiceToPdf(id),
            filename,
            `Export PDF de la facture ${invoiceNumber || id} terminé`
        );
    }

    /**
     * Méthode helper pour vérifier les permissions sur les statuts
     */
    canChangeStatus(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): boolean {
        const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
            [InvoiceStatus.BROUILLON]: [InvoiceStatus.EMISE, InvoiceStatus.ANNULEE],
            [InvoiceStatus.EMISE]: [InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE, InvoiceStatus.EN_RETARD],
            [InvoiceStatus.PAYEE]: [], // Aucune transition depuis PAYEE
            [InvoiceStatus.ANNULEE]: [InvoiceStatus.BROUILLON],
            [InvoiceStatus.EN_RETARD]: [InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE]
        };

        return transitions[currentStatus]?.includes(newStatus) || false;
    }

    /**
     * Obtient les statuts disponibles pour une transition
     */
    getAvailableStatuses(currentStatus: InvoiceStatus): InvoiceStatus[] {
        const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
            [InvoiceStatus.BROUILLON]: [InvoiceStatus.EMISE, InvoiceStatus.ANNULEE],
            [InvoiceStatus.EMISE]: [InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE],
            [InvoiceStatus.PAYEE]: [],
            [InvoiceStatus.ANNULEE]: [InvoiceStatus.BROUILLON],
            [InvoiceStatus.EN_RETARD]: [InvoiceStatus.PAYEE, InvoiceStatus.ANNULEE]
        };

        return transitions[currentStatus] || [];
    }

    /**
     * Obtient le libellé d'un statut
     */
    getStatusLabel(status: InvoiceStatus): string {
        const labels: Record<InvoiceStatus, string> = {
            [InvoiceStatus.BROUILLON]: 'Brouillon',
            [InvoiceStatus.EMISE]: 'Émise',
            [InvoiceStatus.PAYEE]: 'Payée',
            [InvoiceStatus.ANNULEE]: 'Annulée',
            [InvoiceStatus.EN_RETARD]: 'En retard'
        };

        return labels[status] || status;
    }

    generateInvoiceNumber(total: string): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const nextNumber = total + 1;
        const numberPart = String(nextNumber).padStart(4, '0');

        return `FAC-${year}-${month}-${numberPart}`;
    }

    /**
     * Obtient la classe CSS pour un statut (pour PrimeNG)
     */
    getStatusSeverity(status: InvoiceStatus): string {
        const severities: Record<InvoiceStatus, string> = {
            [InvoiceStatus.BROUILLON]: 'secondary',
            [InvoiceStatus.EMISE]: 'info',
            [InvoiceStatus.PAYEE]: 'success',
            [InvoiceStatus.ANNULEE]: 'danger',
            [InvoiceStatus.EN_RETARD]: 'warn'
        };

        return severities[status] || 'secondary';
    }

    /**
     * Calcule si une facture est en retard
     */
    isInvoiceOverdue(invoice: Invoice): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(invoice.dateEcheance);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today &&
            (invoice.statut === InvoiceStatus.EMISE || invoice.statut === InvoiceStatus.BROUILLON);
    }

    /**
     * Calcule le nombre de jours de retard
     */
    getDaysOverdue(invoice: Invoice): number {
        if (!this.isInvoiceOverdue(invoice)) {
            return 0;
        }

        const today = new Date();
        const dueDate = new Date(invoice.dateEcheance);
        const diffTime = today.getTime() - dueDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Formate un montant en devise avec séparateurs
     */
    formatAmount(amount: number, currency = 'XOF'): string {
        const formatter = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency === 'XOF' ? 'XOF' : 'EUR',
            minimumFractionDigits: currency === 'XOF' ? 0 : 2
        });

        return formatter.format(amount);
    }

    /**
     * Calcule le total TTC d'une facture
     */
    calculateTotalTTC(sousTotal: number, tauxTva: number): number {
        const tva = sousTotal * (tauxTva / 100);
        return sousTotal + tva;
    }

    /**
     * Calcule la TVA d'une facture
     */
    calculateTVA(sousTotal: number, tauxTva: number): number {
        return sousTotal * (tauxTva / 100);
    }
}
