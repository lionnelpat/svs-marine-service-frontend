// core/services/error-handler.service.ts
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { MessageService } from 'primeng/api';

export interface AppError {
    message: string;
    code?: string;
    details?: any;
}

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {
    constructor(
        private readonly logger: LoggerService,
        private readonly messageService: MessageService
    ) {}

    handleError(error: any, context?: string): void {
        const errorMessage = this.extractErrorMessage(error);
        const fullContext = context ? `${context} - ${errorMessage}` : errorMessage;

        this.logger.error(fullContext, error);

        // Affichage d'un message utilisateur convivial
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: this.getUserFriendlyMessage(error),
            life: 5000
        });
    }

    handleHttpError(error: any, operation: string): void {
        const statusCode = error.status || 0;
        const errorMessage = error.error?.message || error.message || 'Erreur inconnue';

        this.logger.error(`Erreur HTTP ${statusCode} lors de ${operation}`, {
            status: statusCode,
            message: errorMessage,
            url: error.url
        });

        let  userMessage = 'Une erreur s\'est produite';

        switch (statusCode) {
            case 0:
                userMessage = 'Impossible de contacter le serveur';
                break;
            case 400:
                userMessage = 'Données invalides';
                break;
            case 401:
                userMessage = 'Accès non autorisé';
                break;
            case 403:
                userMessage = 'Action interdite';
                break;
            case 404:
                userMessage = 'Ressource non trouvée';
                break;
            case 500:
                userMessage = 'Erreur du serveur';
                break;
            default:
                userMessage = errorMessage;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: userMessage,
            life: 5000
        });
    }

    private extractErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error?.message) return error.message;
        if (error?.error?.message) return error.error.message;
        return 'Erreur inconnue';
    }

    private getUserFriendlyMessage(error: any): string {
        // Conversion des erreurs techniques en messages utilisateur
        const technicalMessage = this.extractErrorMessage(error).toLowerCase();

        if (technicalMessage.includes('network')) {
            return 'Problème de connexion réseau';
        }
        if (technicalMessage.includes('timeout')) {
            return 'La requête a pris trop de temps';
        }
        if (technicalMessage.includes('validation')) {
            return 'Données invalides, veuillez vérifier votre saisie';
        }

        return 'Une erreur inattendue s\'est produite';
    }
}
