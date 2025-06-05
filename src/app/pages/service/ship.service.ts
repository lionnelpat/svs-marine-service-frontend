// pages/service/ship.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
    Ship,
    CreateShipRequest,
    UpdateShipRequest,
    ShipListFilter,
    ShipListResponse
} from '../../shared/models/ship.model';
import { FAKE_SHIPS } from '../../shared/data/ship.data';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { CompanyService } from './company.service';

@Injectable({
    providedIn: 'root'
})
export class ShipService {
    private ships: Ship[] = [...FAKE_SHIPS];
    private nextId = Math.max(...this.ships.map(s => s.id)) + 1;

    constructor(
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService,
        private  readonly companyService: CompanyService
    ) {}

    /**
     * Récupère la liste des navires avec filtres et pagination
     */
    getShips(filter: ShipListFilter = {}): Observable<ShipListResponse> {
        this.logger.info('Récupération de la liste des navires', filter);

        try {
            let filteredShips = [...this.ships];

            // Filtres
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                filteredShips = filteredShips.filter(ship =>
                    ship.nom.toLowerCase().includes(searchLower) ||
                    ship.numeroIMO.toLowerCase().includes(searchLower) ||
                    ship.numeroMMSI.toLowerCase().includes(searchLower) ||
                    ship.numeroAppel.toLowerCase().includes(searchLower) ||
                    ship.portAttache.toLowerCase().includes(searchLower)
                );
            }

            if (filter.compagnieId) {
                filteredShips = filteredShips.filter(ship =>
                    ship.compagnieId === filter.compagnieId
                );
            }

            if (filter.typeNavire) {
                filteredShips = filteredShips.filter(ship =>
                    ship.typeNavire.toLowerCase() === filter.typeNavire!.toLowerCase()
                );
            }

            if (filter.pavillon) {
                filteredShips = filteredShips.filter(ship =>
                    ship.pavillon.toLowerCase().includes(filter.pavillon!.toLowerCase())
                );
            }

            if (filter.active !== undefined) {
                filteredShips = filteredShips.filter(ship =>
                    ship.active === filter.active
                );
            }

            // Pagination
            const page = filter.page || 0;
            const size = filter.size || 10;
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedShips = filteredShips.slice(startIndex, endIndex);

            const response: ShipListResponse = {
                ships: paginatedShips,
                total: filteredShips.length,
                page,
                size
            };

            this.logger.debug(`${paginatedShips.length} navires récupérés sur ${filteredShips.length} total`);

            return of(response).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, 'Récupération des navires');
            return throwError(() => error);
        }
    }

    /**
     * Récupère un navire par son ID
     */
    getShipById(id: number): Observable<Ship> {
        this.logger.info(`Récupération du navire ID: ${id}`);

        try {
            const ship = this.ships.find(s => s.id === id);

            if (!ship) {
                const error = new Error(`Navire avec l'ID ${id} non trouvé`);
                this.errorHandler.handleError(error, 'Récupération navire');
                return throwError(() => error);
            }

            this.logger.debug(`Navire trouvé: ${ship.nom}`);
            return of(ship).pipe(delay(200));
        } catch (error) {
            this.errorHandler.handleError(error, `Récupération navire ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Crée un nouveau navire
     */
    createShip(request: CreateShipRequest): Observable<Ship> {
        this.logger.info('Création d\'un nouveau navire', { nom: request.nom });

        try {
            // Validation numéro IMO unique
            if (this.ships.some(s => s.numeroIMO === request.numeroIMO)) {
                const error = new Error('Un navire avec ce numéro IMO existe déjà');
                this.errorHandler.handleError(error, 'Création navire');
                return throwError(() => error);
            }

            // Validation numéro MMSI unique
            if (this.ships.some(s => s.numeroMMSI === request.numeroMMSI)) {
                const error = new Error('Un navire avec ce numéro MMSI existe déjà');
                this.errorHandler.handleError(error, 'Création navire');
                return throwError(() => error);
            }


            const newShip: Ship = {
                portAttache: '',
                id: this.nextId++,
                ...request,
                created_at: new Date(),
                updated_at: new Date(),
                active: true
            };

            this.ships.push(newShip);
            this.logger.info(`Navire créé avec succès: ${newShip.nom} (ID: ${newShip.id})`);

            return of(newShip).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, 'Création navire');
            return throwError(() => error);
        }
    }

    /**
     * Met à jour un navire existant
     */
    updateShip(request: UpdateShipRequest): Observable<Ship> {
        this.logger.info(`Mise à jour du navire ID: ${request.id}`, { nom: request.nom });

        try {
            const index = this.ships.findIndex(s => s.id === request.id);

            if (index === -1) {
                const error = new Error(`Navire avec l'ID ${request.id} non trouvé`);
                this.errorHandler.handleError(error, 'Mise à jour navire');
                return throwError(() => error);
            }

            // Validation numéro IMO unique (exclure le navire actuel)
            if (this.ships.some(s => s.id !== request.id && s.numeroIMO === request.numeroIMO)) {
                const error = new Error('Un autre navire avec ce numéro IMO existe déjà');
                this.errorHandler.handleError(error, 'Mise à jour navire');
                return throwError(() => error);
            }

            // Validation numéro MMSI unique (exclure le navire actuel)
            if (this.ships.some(s => s.id !== request.id && s.numeroMMSI === request.numeroMMSI)) {
                const error = new Error('Un autre navire avec ce numéro MMSI existe déjà');
                this.errorHandler.handleError(error, 'Mise à jour navire');
                return throwError(() => error);
            }


            const existingShip = this.ships[index];
            const updatedShip: Ship = {
                ...existingShip,
                ...request,
                updated_at: new Date()
            };

            this.ships[index] = updatedShip;
            this.logger.info(`Navire mis à jour avec succès: ${updatedShip.nom}`);

            return of(updatedShip).pipe(delay(500));
        } catch (error) {
            this.errorHandler.handleError(error, `Mise à jour navire ID: ${request.id}`);
            return throwError(() => error);
        }
    }

    /**
     * Supprime un navire
     */
    deleteShip(id: number): Observable<boolean> {
        this.logger.info(`Suppression du navire ID: ${id}`);

        try {
            const index = this.ships.findIndex(s => s.id === id);

            if (index === -1) {
                const error = new Error(`Navire avec l'ID ${id} non trouvé`);
                this.errorHandler.handleError(error, 'Suppression navire');
                return throwError(() => error);
            }

            const shipName = this.ships[index].nom;
            this.ships.splice(index, 1);
            this.logger.info(`Navire supprimé avec succès: ${shipName}`);

            return of(true).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Suppression navire ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Active/désactive un navire
     */
    toggleShipStatus(id: number): Observable<Ship> {
        this.logger.info(`Changement de statut du navire ID: ${id}`);

        try {
            const ship = this.ships.find(s => s.id === id);

            if (!ship) {
                const error = new Error(`Navire avec l'ID ${id} non trouvé`);
                this.errorHandler.handleError(error, 'Changement statut navire');
                return throwError(() => error);
            }

            ship.active = !ship.active;
            ship.updated_at = new Date();

            this.logger.info(`Statut changé pour ${ship.nom}: ${ship.active ? 'Actif' : 'Inactif'}`);

            return of(ship).pipe(delay(300));
        } catch (error) {
            this.errorHandler.handleError(error, `Changement statut navire ID: ${id}`);
            return throwError(() => error);
        }
    }

    /**
     * Récupère les navires d'une compagnie
     */
    getShipsByCompany(compagnieId: number): Observable<Ship[]> {
        this.logger.info(`Récupération des navires de la compagnie ID: ${compagnieId}`);

        try {
            const companyShips = this.ships.filter(ship => ship.compagnieId === compagnieId && ship.active);
            this.logger.debug(`${companyShips.length} navires trouvés pour la compagnie ${compagnieId}`);

            return of(companyShips).pipe(delay(200));
        } catch (error) {
            this.errorHandler.handleError(error, `Récupération navires compagnie ID: ${compagnieId}`);
            return throwError(() => error);
        }
    }

    /**
     * Statistiques des navires
     */
    getShipStatistics(): Observable<any> {
        try {
            const activeShips = this.ships.filter(s => s.active);
            const stats = {
                totalShips: this.ships.length,
                activeShips: activeShips.length,
                inactiveShips: this.ships.length - activeShips.length,
                shipsByType: this.getShipsByType(),
                shipsByFlag: this.getShipsByFlag()
            };

            return of(stats).pipe(delay(200));
        } catch (error) {
            this.errorHandler.handleError(error, 'Calcul statistiques navires');
            return throwError(() => error);
        }
    }

    private getShipsByType(): any {
        const typeCount: { [key: string]: number } = {};
        this.ships.forEach(ship => {
            typeCount[ship.typeNavire] = (typeCount[ship.typeNavire] || 0) + 1;
        });
        return typeCount;
    }

    private getShipsByFlag(): any {
        const flagCount: { [key: string]: number } = {};
        this.ships.forEach(ship => {
            flagCount[ship.pavillon] = (flagCount[ship.pavillon] || 0) + 1;
        });
        return flagCount;
    }
}
