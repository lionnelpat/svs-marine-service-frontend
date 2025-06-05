// 📁 shared/utils/validation.utils.ts - Exemple d'autre utilitaire
export class ValidationUtils {
    static isValidEmail(email: string | undefined | null): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidCode(code: string | undefined | null): boolean {
        if (!code) return false;
        const codeRegex = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
        return codeRegex.test(code);
    }
}
