import {HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";

export const getErrorMessage = (error: any) => {
    return (
        error?.error?.detail ||
        error?.error?.message ||
        error?.message
    );
};

export const getApiErrorMessage = (err: any): string =>  {
    console.log(err)
    if (err.error && err.error.detail) {
        return err.error.detail;  // Utilise le champ 'detail' du backend
    } else if (err.message) {
        return err.message;  // Si un message existe dans l'objet d'erreur
    } else if (err.name === 'TimeoutError') {
        // Message spécifique en cas de timeout
        return 'Le délai de réponse du serveur a été dépassé. Veuillez réessayer.';
    }
    else {
        return 'Une erreur est survenue. Veuillez réessayer plus tard.';
    }
}

export const handleHttpError = (error: HttpErrorResponse): Observable<never> =>  {
    console.error('Delivery problem:', error);
    const errorMessage = getApiErrorMessage(error);  // Appelle la fonction utilitaire pour obtenir un message clair
    return throwError(() => new Error(errorMessage || 'Erreur Inconnue! Veuillez contacter le service Technique.')); // Retourne une erreur observable
}
