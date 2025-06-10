import { AbstractControl, FormGroup } from '@angular/forms';

export class FormErrorUtils {
    /**
     * Applique les erreurs serveur aux champs du formulaire
     */
    static applyServerErrors(form: FormGroup, details: Record<string, string>) {
        if (!details) return;
        Object.keys(details).forEach(key => {
            const control = form.get(key);
            if (control) {
                control.setErrors({ serverError: details[key] });
            }
        });
    }

    /**
     * Récupère l'erreur serveur d'un champ
     */
    static getServerError(control: AbstractControl | null): string | null {
        if (!control || !control.errors) return null;
        return control.errors['serverError'] || null;
    }
}
