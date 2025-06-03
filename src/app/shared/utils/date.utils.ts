/**
 *
 */
export class DateUtils {
    static formatDate(date: Date | string | undefined | null): string {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);

        if (isNaN(dateObj.getTime())) return '';

        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }

    static isValidDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }
}
