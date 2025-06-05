

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

import {
    Expense,
    ExpenseListFilter,
    ExpenseListResponse,
    ExpenseStatistics,
    ExpenseStatus,
    CreateExpenseRequest,
    UpdateExpenseRequest,
    ExpenseExportData,
    PaymentMethod,
    Currency
} from '../../shared/models/expense.model';
import { MOCK_EXPENSES, MOCK_EXPENSE_CATEGORIES, MOCK_EXPENSE_SUPPLIERS, EXPENSE_CONFIG } from '../../shared/data/expense.data';
import { LoggerService } from '../../core/services/logger.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private readonly expensesSubject = new BehaviorSubject<Expense[]>(MOCK_EXPENSES);
    public expenses$ = this.expensesSubject.asObservable();

    constructor(
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {
        this.logger.info('ExpenseService initialisé');
    }

    // Récupération des dépenses avec pagination et filtres
    getExpenses(filter?: ExpenseListFilter): Observable<ExpenseListResponse> {
        this.logger.debug('Récupération des dépenses', filter);

        return of(this.expensesSubject.value).pipe(
            delay(300),
            map(expenses => {
                let filteredExpenses = this.applyFilter(expenses, filter);

                // Pagination
                const page = filter?.page || 0;
                const size = filter?.size || 10;
                const startIndex = page * size;
                const endIndex = startIndex + size;

                return {
                    expenses: filteredExpenses.slice(startIndex, endIndex),
                    total: filteredExpenses.length,
                    page,
                    size
                };
            }),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la récupération des dépenses');
                return throwError(() => error);
            })
        );
    }

    // Récupération d'une dépense par ID
    getExpenseById(id: number): Observable<Expense | undefined> {
        this.logger.debug('Récupération dépense par ID', { id });

        return of(this.expensesSubject.value.find(expense => expense.id === id)).pipe(
            delay(200),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la récupération de la dépense ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Création d'une dépense
    createExpense(request: CreateExpenseRequest): Observable<Expense> {
        this.logger.info('Création d\'une nouvelle dépense', request);

        return of(request).pipe(
            delay(500),
            map(req => {
                const currentExpenses = this.expensesSubject.value;
                const maxId = Math.max(...currentExpenses.map(exp => exp.id), 0);
                const newId = maxId + 1;

                // Générer le numéro de dépense
                const numero = this.generateExpenseNumber();

                // Récupérer les objets complets
                const categorie = MOCK_EXPENSE_CATEGORIES.find(c => c.id === req.categorieId);
                const fournisseur = req.fournisseurId ?
                    MOCK_EXPENSE_SUPPLIERS.find(s => s.id === req.fournisseurId) : undefined;

                if (!categorie) {
                    throw new Error('Catégorie non trouvée');
                }

                // Calculer le montant en XOF si nécessaire
                let montantXOF = req.montantXOF;

                const newExpense: Expense = {
                    id: newId,
                    numero,
                    titre: req.titre,
                    description: req.description,
                    categorieId: req.categorieId,
                    categorie,
                    fournisseurId: req.fournisseurId,
                    fournisseur,
                    dateDepense: req.dateDepense,
                    montantXOF: req.montantXOF,
                    montantEURO: req.montantEURO,
                    tauxChange: req.montantEURO && req.montantXOF ? req.montantXOF / req.montantEURO : undefined,
                    devise: Currency.XOF,
                    modePaiement: req.modePaiement,
                    statut: ExpenseStatus.EN_ATTENTE,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                this.expensesSubject.next([...currentExpenses, newExpense]);
                this.logger.info('Dépense créée avec succès', { id: newExpense.id });
                return newExpense;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la création de la dépense');
                return throwError(() => error);
            })
        );
    }

    // Mise à jour d'une dépense
    updateExpense(request: UpdateExpenseRequest): Observable<Expense> {
        this.logger.info('Mise à jour de la dépense', { id: request.id });

        return of(this.expensesSubject.value).pipe(
            delay(400),
            map(expenses => {
                const index = expenses.findIndex(exp => exp.id === request.id);
                if (index === -1) {
                    throw new Error(`Dépense avec l'ID ${request.id} non trouvée`);
                }

                // Récupérer les objets complets
                const categorie = MOCK_EXPENSE_CATEGORIES.find(c => c.id === request.categorieId);
                const fournisseur = request.fournisseurId ?
                    MOCK_EXPENSE_SUPPLIERS.find(s => s.id === request.fournisseurId) : undefined;

                if (!categorie) {
                    throw new Error('Catégorie non trouvée');
                }

                // Calculer le montant en XOF si nécessaire
                let montantXOF = request.montantXOF;

                const updatedExpense: Expense = {
                    ...expenses[index],
                    titre: request.titre,
                    description: request.description,
                    categorieId: request.categorieId,
                    categorie,
                    fournisseurId: request.fournisseurId,
                    fournisseur,
                    dateDepense: request.dateDepense,
                    montantXOF: request.montantXOF,
                    montantEURO: request.montantEURO,
                    tauxChange: request.montantEURO && request.montantXOF ? request.montantXOF / request.montantEURO : undefined,
                    modePaiement: request.modePaiement,
                    updated_at: new Date()
                };

                const updatedExpenses = [...expenses];
                updatedExpenses[index] = updatedExpense;
                this.expensesSubject.next(updatedExpenses);

                this.logger.info('Dépense mise à jour avec succès', { id: request.id });
                return updatedExpense;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la mise à jour de la dépense ${request.id}`);
                return throwError(() => error);
            })
        );
    }

    // Suppression d'une dépense (suppression définitive)
    deleteExpense(id: number): Observable<boolean> {
        this.logger.info('Suppression de la dépense', { id });

        return of(this.expensesSubject.value).pipe(
            delay(300),
            map(expenses => {
                const filteredExpenses = expenses.filter(exp => exp.id !== id);
                if (filteredExpenses.length === expenses.length) {
                    throw new Error(`Dépense avec l'ID ${id} non trouvée`);
                }

                this.expensesSubject.next(filteredExpenses);
                this.logger.info('Dépense supprimée avec succès', { id });
                return true;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors de la suppression de la dépense ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Changement de statut d'une dépense
    updateExpenseStatus(id: number, status: ExpenseStatus): Observable<Expense> {
        this.logger.info('Changement de statut de dépense', { id, status });

        return of(this.expensesSubject.value).pipe(
            delay(300),
            map(expenses => {
                const index = expenses.findIndex(exp => exp.id === id);
                if (index === -1) {
                    throw new Error(`Dépense avec l'ID ${id} non trouvée`);
                }

                const updatedExpense = {
                    ...expenses[index],
                    statut: status,
                    updated_at: new Date()
                };

                // Ajouter des informations d'approbation si nécessaire
                if (status === ExpenseStatus.APPROUVEE) {
                    // Dans un vrai système, ces informations viendraient de l'utilisateur connecté
                }

                const updatedExpenses = [...expenses];
                updatedExpenses[index] = updatedExpense;
                this.expensesSubject.next(updatedExpenses);

                this.logger.info('Statut de dépense mis à jour', { id, status });
                return updatedExpense;
            }),
            catchError(error => {
                this.errorHandler.handleError(error, `Erreur lors du changement de statut de la dépense ${id}`);
                return throwError(() => error);
            })
        );
    }

    // Statistiques des dépenses
    getStatistics(): Observable<ExpenseStatistics> {
        this.logger.debug('Calcul des statistiques de dépenses');

        return of(this.expensesSubject.value).pipe(
            delay(200),
            map(expenses => this.calculateStatistics(expenses)),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors du calcul des statistiques');
                return throwError(() => error);
            })
        );
    }

    // Export des données
    getExpensesForExport(filter?: ExpenseListFilter): Observable<ExpenseExportData[]> {
        this.logger.info('Préparation des données pour export', filter);

        return this.getExpenses(filter).pipe(
            map(response => response.expenses.map(expense => ({
                numero: expense.numero,
                titre: expense.titre,
                categorie: expense.categorie?.nom || '',
                fournisseur: expense.fournisseur?.nom || 'N/A',
                dateDepense: expense.dateDepense.toLocaleDateString('fr-FR'),
                montantXOF: expense.montantXOF,
                montantEURO: expense.montantEURO || 0,
                devise: expense.devise,
                modePaiement: this.getPaymentMethodLabel(expense.modePaiement),
                statut: this.getStatusLabel(expense.statut)
            }))),
            catchError(error => {
                this.errorHandler.handleError(error, 'Erreur lors de la préparation des données d\'export');
                return throwError(() => error);
            })
        );
    }

    // Génération du prochain numéro de dépense
    generateExpenseNumber(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const currentExpenses = this.expensesSubject.value.filter(exp => {
            const expDate = new Date(exp.dateDepense);
            return expDate.getFullYear() === year && expDate.getMonth() === now.getMonth();
        });

        const nextNumber = currentExpenses.length + 1;
        const numberPart = String(nextNumber).padStart(4, '0');

        return `${EXPENSE_CONFIG.numeroPrefix}-${year}-${month}-${numberPart}`;
    }

    // Récupération des catégories
    getCategories(): Observable<any[]> {
        return of(MOCK_EXPENSE_CATEGORIES).pipe(delay(100));
    }

    // Récupération des fournisseurs
    getSuppliers(): Observable<any[]> {
        return of(MOCK_EXPENSE_SUPPLIERS).pipe(delay(100));
    }

    // Méthodes utilitaires privées
    private applyFilter(expenses: Expense[], filter?: ExpenseListFilter): Expense[] {
        if (!filter) return expenses;

        return expenses.filter(expense => {
            if (filter.search && !this.matchesSearch(expense, filter.search)) return false;
            if (filter.categorieId && expense.categorieId !== filter.categorieId) return false;
            if (filter.fournisseurId && expense.fournisseurId !== filter.fournisseurId) return false;
            if (filter.statut && expense.statut !== filter.statut) return false;
            if (filter.modePaiement && expense.modePaiement !== filter.modePaiement) return false;
            if (filter.dateDebut && expense.dateDepense < filter.dateDebut) return false;
            if (filter.dateFin && expense.dateDepense > filter.dateFin) return false;
            if (filter.mois && expense.dateDepense.getMonth() + 1 !== filter.mois) return false;
            if (filter.annee && expense.dateDepense.getFullYear() !== filter.annee) return false;
            if (filter.montantMin && expense.montantXOF < filter.montantMin) return false;
            if (filter.montantMax && expense.montantXOF > filter.montantMax) return false;

            return true;
        });
    }

    private matchesSearch(expense: Expense, search: string): boolean {
        const searchLower = search.toLowerCase();
        return expense.numero.toLowerCase().includes(searchLower) ||
            expense.titre.toLowerCase().includes(searchLower) ||
            expense.description.toLowerCase().includes(searchLower) ||
            (expense.categorie?.nom?.toLowerCase().includes(searchLower) ?? false) ||
            (expense.fournisseur?.nom?.toLowerCase().includes(searchLower) ?? false);
    }

    private calculateStatistics(expenses: Expense[]): ExpenseStatistics {
        const totalDepenses = expenses.length;
        const montantTotalXOF = expenses.reduce((sum, exp) => sum + exp.montantXOF, 0);
        const montantTotalEURO = expenses.reduce((sum, exp) => sum + (exp.montantEURO || 0), 0);

        const depensesEnAttente = expenses.filter(exp => exp.statut === ExpenseStatus.EN_ATTENTE).length;
        const depensesApprouvees = expenses.filter(exp => exp.statut === ExpenseStatus.APPROUVEE).length;
        const depensesRejetees = expenses.filter(exp => exp.statut === ExpenseStatus.REJETEE).length;
        const depensesRemboursables = 0; // Propriété supprimée du modèle
        const depensesRemboursees = 0; // Propriété supprimée du modèle

        // Calcul par catégorie
        const depensesParCategorie = this.calculateCategoryStats(expenses);

        // Calcul par mois
        const depensesParMois = this.calculateMonthlyStats(expenses);

        // Top fournisseurs
        const topFournisseurs = this.calculateTopSuppliers(expenses);

        return {
            totalDepenses,
            montantTotalXOF,
            montantTotalEURO,
            depensesEnAttente,
            depensesApprouvees,
            depensesRejetees,
            depensesRemboursables,
            depensesRemboursees,
            depensesParCategorie,
            depensesParMois,
            topFournisseurs
        };
    }

    private calculateCategoryStats(expenses: Expense[]) {
        const categoryMap = new Map();

        expenses.forEach(expense => {
            const categoryId = expense.categorieId;
            const categoryName = expense.categorie?.nom || 'Inconnue';

            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    categorieId: categoryId,
                    categorieNom: categoryName,
                    nombreDepenses: 0,
                    montantTotalXOF: 0,
                    montantTotalEURO: 0,
                    pourcentage: 0
                });
            }

            const stats = categoryMap.get(categoryId);
            stats.nombreDepenses++;
            stats.montantTotalXOF += expense.montantXOF;
            stats.montantTotalEURO += expense.montantEURO || 0;
        });

        const totalAmount = expenses.reduce((sum, exp) => sum + exp.montantXOF, 0);
        return Array.from(categoryMap.values())
            .map(stats => ({
                ...stats,
                pourcentage: totalAmount > 0 ? (stats.montantTotalXOF / totalAmount) * 100 : 0
            }))
            .sort((a, b) => b.montantTotalXOF - a.montantTotalXOF);
    }

    private calculateMonthlyStats(expenses: Expense[]) {
        const monthlyMap = new Map();

        expenses.forEach(expense => {
            const date = new Date(expense.dateDepense);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            if (!monthlyMap.has(key)) {
                monthlyMap.set(key, {
                    mois: date.getMonth() + 1,
                    annee: date.getFullYear(),
                    nombreDepenses: 0,
                    montantTotalXOF: 0,
                    montantTotalEURO: 0
                });
            }

            const stats = monthlyMap.get(key);
            stats.nombreDepenses++;
            stats.montantTotalXOF += expense.montantXOF;
            stats.montantTotalEURO += expense.montantEURO || 0;
        });

        return Array.from(monthlyMap.values()).sort((a, b) =>
            (a.annee * 12 + a.mois) - (b.annee * 12 + b.mois)
        );
    }

    private calculateTopSuppliers(expenses: Expense[]) {
        const supplierMap = new Map();

        expenses.forEach(expense => {
            if (!expense.fournisseurId) return;

            const supplierId = expense.fournisseurId;
            const supplierName = expense.fournisseur?.nom || 'Inconnu';

            if (!supplierMap.has(supplierId)) {
                supplierMap.set(supplierId, {
                    fournisseurId: supplierId,
                    fournisseurNom: supplierName,
                    nombreDepenses: 0,
                    montantTotalXOF: 0,
                    montantTotalEURO: 0
                });
            }

            const stats = supplierMap.get(supplierId);
            stats.nombreDepenses++;
            stats.montantTotalXOF += expense.montantXOF;
            stats.montantTotalEURO += expense.montantEURO || 0;
        });

        return Array.from(supplierMap.values())
            .sort((a, b) => b.montantTotalXOF - a.montantTotalXOF)
            .slice(0, 5); // Top 5
    }

    private getStatusLabel(status: ExpenseStatus): string {
        const labels: { [key in ExpenseStatus]: string } = {
            [ExpenseStatus.EN_ATTENTE]: 'En attente',
            [ExpenseStatus.APPROUVEE]: 'Approuvée',
            [ExpenseStatus.REJETEE]: 'Rejetée',
            [ExpenseStatus.PAYEE]: 'Payée'
        };
        return labels[status];
    }

    private getPaymentMethodLabel(method: PaymentMethod): string {
        const labels: { [key in PaymentMethod]: string } = {
            [PaymentMethod.ESPECES]: 'Espèces',
            [PaymentMethod.CHEQUE]: 'Chèque',
            [PaymentMethod.VIREMENT]: 'Virement',
            [PaymentMethod.CARTE_BANCAIRE]: 'Carte bancaire',
            [PaymentMethod.MOBILE_MONEY]: 'Mobile Money',
            [PaymentMethod.AUTRE]: 'Autre'
        };
        return labels[method];
    }
}
