// src/app/pages/service/invoice.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

import {
    Invoice,
    InvoiceListFilter,
    InvoiceListResponse,
    InvoiceStatistics,
    InvoiceStatus,
    CreateInvoiceRequest,
    UpdateInvoiceRequest,
    InvoiceExportData
} from '../../shared/models/invoice.model';
import { MOCK_INVOICES, MOCK_COMPANIES, MOCK_SHIPS, MOCK_OPERATIONS } from '../../shared/data/invoice.data';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private invoicesSubject = new BehaviorSubject<Invoice[]>(MOCK_INVOICES);
    public invoices$ = this.invoicesSubject.asObservable();

    constructor(
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {
        this.logger.info('InvoiceService initialisé');
    }

    // Récupération des factures avec pagination et filtres
    getInvoices(filter?: InvoiceListFilter): Observable<InvoiceListResponse> {
        this.logger.debug('Récupération des factures', filter);

        return of(this.invoicesSubject.value).pipe(
            delay(300), // Simulation latence réseau
            map(invoices => {
                let filteredInvoices = this.applyFilter(invoices, filter);

                // Pagination
                const page = filter?.page || 0;
                const size = filter?.size || 10;
                const startIndex = page * size;
                const endIndex = startIndex + size;

                return {
                    invoices: filteredInvoices.slice(startIndex, endIndex),
                    total: filteredInvoices.length,
                    page,
                    size
                };
            }),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la récupération des factures');
                return throwError(() => error);
            })
        );
    }

    // Récupération d'une facture par ID
    getInvoiceById(id: number): Observable<Invoice | undefined> {
        this.logger.debug('Récupération facture par ID', { id });

        return of(this.invoicesSubject.value.find(invoice => invoice.id === id)).pipe(
            delay(200),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la récupération de la facture ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Création d'une facture
    createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
        this.logger.info('Création d\'une nouvelle facture', request);

        return of(request).pipe(
            delay(500),
            map(req => {
                const currentInvoices = this.invoicesSubject.value;
                const maxId = Math.max(...currentInvoices.map(inv => inv.id), 0);
                const newId = maxId + 1;

                // Générer le numéro de facture
                const numero = this.generateInvoiceNumber();

                // Récupérer les objets complets
                const compagnie = MOCK_COMPANIES.find(c => c.id === req.compagnieId);
                const navire = MOCK_SHIPS.find(s => s.id === req.navireId);

                if (!compagnie || !navire) {
                    throw new Error('Compagnie ou navire non trouvé');
                }

                // Calculer les totaux
                const prestations = req.prestations.map((p, index) => {
                    const operation = MOCK_OPERATIONS.find(op => op.id === p.operationId);
                    if (!operation) {
                        throw new Error(`Opération ${p.operationId} non trouvée`);
                    }

                    return {
                        id: newId * 100 + index + 1,
                        operationId: p.operationId,
                        operation,
                        description: p.description,
                        quantite: p.quantite,
                        prixUnitaireXOF: p.prixUnitaireXOF,
                        prixUnitaireEURO: p.prixUnitaireEURO,
                        montantXOF: p.quantite * p.prixUnitaireXOF,
                        montantEURO: p.prixUnitaireEURO ? p.quantite * p.prixUnitaireEURO : undefined
                    };
                });

                const sousTotal = prestations.reduce((sum, p) => sum + p.montantXOF, 0);
                const tva = (sousTotal * req.tauxTva) / 100;
                const montantTotal = sousTotal + tva;

                const newInvoice: Invoice = {
                    id: newId,
                    numero,
                    compagnieId: req.compagnieId,
                    compagnie,
                    navireId: req.navireId,
                    navire,
                    dateFacture: req.dateFacture,
                    dateEcheance: req.dateEcheance,
                    prestations,
                    sousTotal,
                    tauxTva: req.tauxTva,
                    tva,
                    montantTotal,
                    statut: InvoiceStatus.BROUILLON,
                    notes: req.notes,
                    created_at: new Date(),
                    updated_at: new Date(),
                    active: true
                };

                this.invoicesSubject.next([...currentInvoices, newInvoice]);
                this.logger.info('Facture créée avec succès', { id: newInvoice.id });
                return newInvoice;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la création de la facture');
                return throwError(() => error);
            })
        );
    }

    // Mise à jour d'une facture
    updateInvoice(request: UpdateInvoiceRequest): Observable<Invoice> {
        this.logger.info('Mise à jour de la facture', { id: request.id });

        return of(this.invoicesSubject.value).pipe(
            delay(400),
            map(invoices => {
                const index = invoices.findIndex(inv => inv.id === request.id);
                if (index === -1) {
                    throw new Error(`Facture avec l'ID ${request.id} non trouvée`);
                }

                // Récupérer les objets complets
                const compagnie = MOCK_COMPANIES.find(c => c.id === request.compagnieId);
                const navire = MOCK_SHIPS.find(s => s.id === request.navireId);

                if (!compagnie || !navire) {
                    throw new Error('Compagnie ou navire non trouvé');
                }

                // Recalculer les prestations et totaux
                const prestations = request.prestations.map((p, prestIndex) => {
                    const operation = MOCK_OPERATIONS.find(op => op.id === p.operationId);
                    if (!operation) {
                        throw new Error(`Opération ${p.operationId} non trouvée`);
                    }

                    return {
                        id: request.id * 100 + prestIndex + 1,
                        operationId: p.operationId,
                        operation,
                        description: p.description,
                        quantite: p.quantite,
                        prixUnitaireXOF: p.prixUnitaireXOF,
                        prixUnitaireEURO: p.prixUnitaireEURO,
                        montantXOF: p.quantite * p.prixUnitaireXOF,
                        montantEURO: p.prixUnitaireEURO ? p.quantite * p.prixUnitaireEURO : undefined
                    };
                });

                const sousTotal = prestations.reduce((sum, p) => sum + p.montantXOF, 0);
                const tva = (sousTotal * request.tauxTva) / 100;
                const montantTotal = sousTotal + tva;

                const updatedInvoice: Invoice = {
                    ...invoices[index],
                    compagnieId: request.compagnieId,
                    compagnie,
                    navireId: request.navireId,
                    navire,
                    dateFacture: request.dateFacture,
                    dateEcheance: request.dateEcheance,
                    prestations,
                    sousTotal,
                    tauxTva: request.tauxTva,
                    tva,
                    montantTotal,
                    notes: request.notes,
                    updated_at: new Date()
                };

                const updatedInvoices = [...invoices];
                updatedInvoices[index] = updatedInvoice;
                this.invoicesSubject.next(updatedInvoices);

                this.logger.info('Facture mise à jour avec succès', { id: request.id });
                return updatedInvoice;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la mise à jour de la facture ${request.id}`);
                return throwError(() => error);
            })
        );
    }

    // Suppression d'une facture (soft delete)
    deleteInvoice(id: number): Observable<boolean> {
        this.logger.info('Suppression de la facture', { id });

        return of(this.invoicesSubject.value).pipe(
            delay(300),
            map(invoices => {
                const index = invoices.findIndex(inv => inv.id === id);
                if (index === -1) {
                    throw new Error(`Facture avec l'ID ${id} non trouvée`);
                }

                const updatedInvoices = [...invoices];
                updatedInvoices[index] = {
                    ...updatedInvoices[index],
                    active: false,
                    updated_at: new Date()
                };

                this.invoicesSubject.next(updatedInvoices);
                this.logger.info('Facture supprimée avec succès', { id });
                return true;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la suppression de la facture ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Changement de statut d'une facture
    updateInvoiceStatus(id: number, status: InvoiceStatus): Observable<Invoice> {
        this.logger.info('Changement de statut de facture', { id, status });

        return of(this.invoicesSubject.value).pipe(
            delay(300),
            map(invoices => {
                const index = invoices.findIndex(inv => inv.id === id);
                if (index === -1) {
                    throw new Error(`Facture avec l'ID ${id} non trouvée`);
                }

                const updatedInvoice = {
                    ...invoices[index],
                    statut: status,
                    updated_at: new Date()
                };

                const updatedInvoices = [...invoices];
                updatedInvoices[index] = updatedInvoice;
                this.invoicesSubject.next(updatedInvoices);

                this.logger.info('Statut de facture mis à jour', { id, status });
                return updatedInvoice;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors du changement de statut de la facture ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Statistiques des factures
    getStatistics(): Observable<InvoiceStatistics> {
        this.logger.debug('Calcul des statistiques de factures');

        return of(this.invoicesSubject.value).pipe(
            delay(200),
            map(invoices => this.calculateStatistics(invoices.filter(inv => inv.active))),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors du calcul des statistiques');
                return throwError(() => error);
            })
        );
    }

    // Export des données
    getInvoicesForExport(filter?: InvoiceListFilter): Observable<InvoiceExportData[]> {
        this.logger.info('Préparation des données pour export', filter);

        return this.getInvoices(filter).pipe(
            map(response => response.invoices.map(invoice => ({
                numero: invoice.numero,
                compagnie: invoice.compagnie?.nom || '',
                navire: invoice.navire?.nom || '',
                dateFacture: invoice.dateFacture.toLocaleDateString('fr-FR'),
                montantXOF: invoice.montantTotal,
                montantEURO: 0, // À calculer selon le taux de change
                statut: this.getStatusLabel(invoice.statut),
                dateEcheance: invoice.dateEcheance.toLocaleDateString('fr-FR')
            }))),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la préparation des données d\'export');
                return throwError(() => error);
            })
        );
    }

    // Génération du prochain numéro de facture
    generateInvoiceNumber(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const currentInvoices = this.invoicesSubject.value.filter(inv => {
            const invDate = new Date(inv.dateFacture);
            return invDate.getFullYear() === year && invDate.getMonth() === now.getMonth();
        });

        const nextNumber = currentInvoices.length + 1;
        const numberPart = String(nextNumber).padStart(4, '0');

        return `FAC-${year}-${month}-${numberPart}`;
    }

    // Méthodes utilitaires privées
    private applyFilter(invoices: Invoice[], filter?: InvoiceListFilter): Invoice[] {
        if (!filter) return invoices.filter(inv => inv.active);

        return invoices.filter(invoice => {
            if (filter.active !== undefined && invoice.active !== filter.active) return false;
            if (filter.search && !this.matchesSearch(invoice, filter.search)) return false;
            if (filter.compagnieId && invoice.compagnieId !== filter.compagnieId) return false;
            if (filter.navireId && invoice.navireId !== filter.navireId) return false;
            if (filter.statut && invoice.statut !== filter.statut) return false;
            if (filter.dateDebut && invoice.dateFacture < filter.dateDebut) return false;
            if (filter.dateFin && invoice.dateFacture > filter.dateFin) return false;
            if (filter.mois && invoice.dateFacture.getMonth() + 1 !== filter.mois) return false;
            if (filter.annee && invoice.dateFacture.getFullYear() !== filter.annee) return false;

            return true;
        });
    }

    private matchesSearch(invoice: Invoice, search: string): boolean {
        const searchLower = search.toLowerCase();

        // Recherche dans le numéro de facture
        if (invoice.numero.toLowerCase().includes(searchLower)) {
            return true;
        }

        // Recherche dans le nom de la compagnie
        if (invoice.compagnie?.nom?.toLowerCase().includes(searchLower)) {
            return true;
        }

        // Recherche dans le nom du navire
        if (invoice.navire?.nom?.toLowerCase().includes(searchLower)) {
            return true;
        }

        // Recherche dans le numéro IMO
        if (invoice.navire?.numeroIMO?.toLowerCase().includes(searchLower)) {
            return true;
        }

        return false;
    }

    private calculateStatistics(invoices: Invoice[]): InvoiceStatistics {
        const totalFactures = invoices.length;
        const totalMontantXOF = invoices.reduce((sum, inv) => sum + inv.montantTotal, 0);
        const totalMontantEURO = 0; // À calculer selon les taux de change

        const facturesPayees = invoices.filter(inv => inv.statut === InvoiceStatus.PAYEE).length;
        const facturesEnAttente = invoices.filter(inv => inv.statut === InvoiceStatus.EMISE).length;
        const facturesEnRetard = invoices.filter(inv => inv.statut === InvoiceStatus.EN_RETARD).length;

        // Calcul par mois (6 derniers mois)
        const facturesParMois = this.calculateMonthlyStats(invoices);

        // Top compagnies
        const topCompagnies = this.calculateTopCompanies(invoices);

        return {
            totalFactures,
            totalMontantXOF,
            totalMontantEURO,
            facturesPayees,
            facturesEnAttente,
            facturesEnRetard,
            facturesParMois,
            topCompagnies
        };
    }

    private calculateMonthlyStats(invoices: Invoice[]) {
        const monthlyMap = new Map();

        invoices.forEach(invoice => {
            const date = new Date(invoice.dateFacture);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            if (!monthlyMap.has(key)) {
                monthlyMap.set(key, {
                    mois: date.getMonth() + 1,
                    annee: date.getFullYear(),
                    nombreFactures: 0,
                    montantTotalXOF: 0,
                    montantTotalEURO: 0
                });
            }

            const stats = monthlyMap.get(key);
            stats.nombreFactures++;
            stats.montantTotalXOF += invoice.montantTotal;
        });

        return Array.from(monthlyMap.values()).sort((a, b) =>
            (a.annee * 12 + a.mois) - (b.annee * 12 + b.mois)
        );
    }

    private calculateTopCompanies(invoices: Invoice[]) {
        const companyMap = new Map();

        invoices.forEach(invoice => {
            const companyId = invoice.compagnieId;
            const companyName = invoice.compagnie?.nom || 'Inconnue';

            if (!companyMap.has(companyId)) {
                companyMap.set(companyId, {
                    compagnieId: companyId,
                    compagnieNom: companyName,
                    nombreFactures: 0,
                    montantTotalXOF: 0,
                    montantTotalEURO: 0
                });
            }

            const stats = companyMap.get(companyId);
            stats.nombreFactures++;
            stats.montantTotalXOF += invoice.montantTotal;
        });

        return Array.from(companyMap.values())
            .sort((a, b) => b.montantTotalXOF - a.montantTotalXOF)
            .slice(0, 5); // Top 5
    }

    private getStatusLabel(status: InvoiceStatus): string {
        const labels: { [key in InvoiceStatus]: string } = {
            [InvoiceStatus.BROUILLON]: 'Brouillon',
            [InvoiceStatus.EMISE]: 'Émise',
            [InvoiceStatus.PAYEE]: 'Payée',
            [InvoiceStatus.EN_RETARD]: 'En retard',
            [InvoiceStatus.ANNULEE]: 'Annulée'
        };
        return labels[status];
    }
}
