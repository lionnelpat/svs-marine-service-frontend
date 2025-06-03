// pages/service/operation.service.ts - Version avec EUR optionnel
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Operation, OperationListFilter, OperationListResponse } from '../../shared/models/operation.model';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { FAKE_OPERATIONS } from '../../shared/data/operation.data';

// Mise à jour du modèle avec EUR optionnel
export interface CreateOperationRequest {
    nom: string;
    description: string;
    code: string;
    prixXOF: number;
    prixEURO?: number; // ✅ Optionnel
}

export interface UpdateOperationRequest extends CreateOperationRequest {
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class OperationService {
    private operations: Operation[] = [...FAKE_OPERATIONS];
    private nextId = Math.max(...this.operations.map(o => o.id)) + 1;
    private readonly DEFAULT_EXCHANGE_RATE = 656; // Taux XOF/EUR par défaut

    constructor(
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    /**
     * Récupère la liste des opérations avec filtres et pagination
     */
    getOperations(filter: OperationListFilter = {}): Observable<OperationListResponse> {
        this.logger.info('Récupération de la liste des opérations', filter);

        try {
            let filteredOperations = [...this.operations];

            // Filtres
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                filteredOperations = filteredOperations.filter(operation =>
                    operation.nom.toLowerCase().includes(searchLower) ||
                    operation.description.toLowerCase().includes(searchLower) ||
                    operation.code.toLowerCase().includes(searchLower)
                );
            }

            if (filter.active !== undefined) {
                filteredOperations = filteredOperations.filter(operation =>
                    operation.active === filter.active
                );
            }

            // Pagination
            const page = filter.page || 0;
            const size = filter.size || 10;
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedOperations = filteredOperations.slice(startIndex, endIndex);

            const response: OperationListResponse = {
                operations: paginatedOperations,
                total: filteredOperations.length,
                page,
                size
            };

            this.logger.debug(`${paginatedOperations.length} opérations récupérées sur ${filteredOperations.length} total`);

            return of(response).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, 'Récupération des opérations');
            return throwError(() => error);
        }
    }

    /**
     * Récupère une opération par son ID
     */
    getOperationById(id: number): Observable<Operation> {
        this.logger.info(`Récupération de l'opération ID: ${id}`);

        try {
            const operation = this.operations.find(o => o.id === id);

            if (!operation) {
                const error = new Error(`Opération avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Récupération opération');
                return throwError(() => error);
            }

            this.logger.debug(`Opération trouvée: ${operation.nom}`);
            return of(operation).pipe(delay(200));
        } catch (error) {
            this.errorHandler.handleError(error, `Récupération opération ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Supprime une opération
     */
    deleteOperation(id: number): Observable<boolean> {
        this.logger.info(`Suppression de l'opération ID: ${id}`);

        try {
            const index = this.operations.findIndex(o => o.id === id);

            if (index === -1) {
                const error = new Error(`Opération avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Suppression opération');
                return throwError(() => error);
            }

            const operationName = this.operations[index].nom;
            this.operations.splice(index, 1);
            this.logger.info(`Opération supprimée avec succès: ${operationName}`);

            return of(true).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Suppression opération ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Active/désactive une opération
     */
    toggleOperationStatus(id: number): Observable<Operation> {
        this.logger.info(`Changement de statut de l'opération ID: ${id}`);

        try {
            const operation = this.operations.find(o => o.id === id);

            if (!operation) {
                const error = new Error(`Opération avec l'ID ${id} non trouvée`);
                this.errorHandler.handleError(error, 'Changement statut opération');
                return throwError(() => error);
            }

            operation.active = !operation.active;
            operation.updated_at = new Date();

            this.logger.info(`Statut changé pour ${operation.nom}: ${operation.active ? 'Actif' : 'Inactive'}`);

            return of(operation).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Changement statut opération ID: ${id}`);
            return throwError(() => error);
        }
    }


    /**
     * Crée une nouvelle opération avec gestion EUR optionnel
     */
    createOperation(request: CreateOperationRequest): Observable<Operation> {
        this.logger.info('Création d\'une nouvelle opération', { nom: request.nom });

        try {
            // Validation code unique
            if (this.operations.some(o => o.code === request.code)) {
                const error = new Error('Une opération avec ce code existe déjà');
                this.errorHandler.handleError(error, 'Création opération');
                return throwError(() => error);
            }

            // ✅ Validation prix avec gestion des valeurs optionnelles/nulles
            const validationResult = this.validatePrices(request.prixXOF, request.prixEURO);
            if (!validationResult.isValid) {
                const error = new Error(validationResult.message);
                this.errorHandler.handleError(error, 'Création opération');
                return throwError(() => error);
            }

            // ✅ Calcul automatique du prix EUR si manquant
            const calculatedPrixEURO = this.calculateEuroPrice(request.prixXOF, request.prixEURO);

            const newOperation: Operation = {
                id: this.nextId++,
                nom: request.nom,
                description: request.description,
                code: request.code,
                prixXOF: request.prixXOF,
                prixEURO: calculatedPrixEURO,
                created_at: new Date(),
                updated_at: new Date(),
                active: true
            };

            this.operations.push(newOperation);
            this.logger.info(`Opération créée avec succès: ${newOperation.nom} (ID: ${newOperation.id})`);

            return of(newOperation).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, 'Création opération');
            return throwError(() => error);
        }
    }

    /**
     * Met à jour une opération existante avec gestion EUR optionnel
     */
    updateOperation(request: UpdateOperationRequest): Observable<Operation> {
        this.logger.info(`Mise à jour de l'opération ID: ${request.id}`, { nom: request.nom });

        try {
            const index = this.operations.findIndex(o => o.id === request.id);

            if (index === -1) {
                const error = new Error(`Opération avec l'ID ${request.id} non trouvée`);
                this.errorHandler.handleError(error, 'Mise à jour opération');
                return throwError(() => error);
            }

            // Validation code unique (exclure l'opération actuelle)
            if (this.operations.some(o => o.id !== request.id && o.code === request.code)) {
                const error = new Error('Une autre opération avec ce code existe déjà');
                this.errorHandler.handleError(error, 'Mise à jour opération');
                return throwError(() => error);
            }

            // ✅ Validation prix avec gestion des valeurs optionnelles/nulles
            const validationResult = this.validatePrices(request.prixXOF, request.prixEURO);
            if (!validationResult.isValid) {
                const error = new Error(validationResult.message);
                this.errorHandler.handleError(error, 'Mise à jour opération');
                return throwError(() => error);
            }

            // ✅ Calcul automatique du prix EUR si manquant
            const calculatedPrixEURO = this.calculateEuroPrice(request.prixXOF, request.prixEURO);

            const existingOperation = this.operations[index];
            const updatedOperation: Operation = {
                ...existingOperation,
                nom: request.nom,
                description: request.description,
                code: request.code,
                prixXOF: request.prixXOF,
                prixEURO: calculatedPrixEURO,
                updated_at: new Date()
            };

            this.operations[index] = updatedOperation;
            this.logger.info(`Opération mise à jour avec succès: ${updatedOperation.nom}`);

            return of(updatedOperation).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, `Mise à jour opération ID: ${request.id}`);
            return throwError(() => error);
        }
    }

    /**
     * ✅ Valide les prix en gérant les cas undefined/null
     */
    private validatePrices(prixXOF: number, prixEURO?: number): { isValid: boolean; message?: string } {
        // Validation du prix XOF (obligatoire)
        if (prixXOF === null || prixXOF === undefined) {
            return { isValid: false, message: 'Le prix en XOF est obligatoire' };
        }

        if (typeof prixXOF !== 'number' || isNaN(prixXOF)) {
            return { isValid: false, message: 'Le prix en XOF doit être un nombre valide' };
        }

        if (prixXOF < 0) {
            return { isValid: false, message: 'Le prix en XOF doit être positif' };
        }

        // Validation du prix EUR (optionnel mais doit être valide s'il est fourni)
        if (prixEURO !== undefined && prixEURO !== null) {
            if (typeof prixEURO !== 'number' || isNaN(prixEURO)) {
                return { isValid: false, message: 'Le prix en EURO doit être un nombre valide' };
            }

            if (prixEURO < 0) {
                return { isValid: false, message: 'Le prix en EURO doit être positif' };
            }
        }

        return { isValid: true };
    }

    /**
     * ✅ Calcule le prix EUR automatiquement si manquant
     */
    private calculateEuroPrice(prixXOF: number, prixEURO?: number): number {
        // Si le prix EUR est fourni et valide, l'utiliser
        if (prixEURO !== undefined && prixEURO !== null && prixEURO > 0) {
            return prixEURO;
        }

        // Sinon, calculer automatiquement basé sur le taux de change
        if (prixXOF > 0) {
            const calculatedEUR = prixXOF / this.getExchangeRate();
            return Math.round(calculatedEUR * 100) / 100; // Arrondir à 2 décimales
        }

        return 0;
    }

    /**
     * ✅ Versions sécurisées pour les comparaisons de prix
     */
    private safePriceComparison(price: number | undefined | null): number {
        return (price !== undefined && price !== null && !isNaN(price)) ? price : 0;
    }

    /**
     * ✅ Formatage sécurisé des prix pour les logs
     */
    private formatPriceForLog(prixXOF: number, prixEURO?: number): string {
        const euroText = prixEURO !== undefined && prixEURO !== null
            ? `${prixEURO} EUR`
            : 'EUR non défini';
        return `${prixXOF} XOF / ${euroText}`;
    }

    /**
     * Calcule le taux de change XOF/EURO basé sur les prix moyens
     * ✅ Gestion sécurisée des prix EUR optionnels
     */
    getExchangeRate(): number {
        const operationsWithBothPrices = this.operations.filter(o =>
            o.prixXOF > 0 &&
            o.prixEURO !== undefined &&
            o.prixEURO !== null &&
            o.prixEURO > 0
        );

        if (operationsWithBothPrices.length === 0) {
            return this.DEFAULT_EXCHANGE_RATE;
        }

        const rates = operationsWithBothPrices.map(o => o.prixXOF / o.prixEURO!); // Safe car filtré
        const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

        return Math.round(averageRate);
    }

    /**
     * ✅ Méthode utilitaire pour vérifier si une opération a un prix EUR valide
     */
    hasValidEuroPrice(operation: Operation): boolean {
        return operation.prixEURO !== undefined &&
            operation.prixEURO !== null &&
            !isNaN(operation.prixEURO) &&
            operation.prixEURO > 0;
    }

    /**
     * ✅ Méthode pour obtenir le prix EUR avec fallback
     */
    getEuroPriceWithFallback(operation: Operation): number {
        if (this.hasValidEuroPrice(operation)) {
            return operation.prixEURO!;
        }

        // Calcul automatique si manquant
        return this.calculateEuroPrice(operation.prixXOF, operation.prixEURO);
    }
}
