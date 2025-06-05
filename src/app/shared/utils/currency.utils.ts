import { LoggerService } from '../../core/services/logger.service';

export interface CurrencyFormatOptions {
    defaultCurrency?: 'XOF' | 'EUR';
    showZeroValues?: boolean;
    customFormat?: boolean;
    compactFormat?: boolean;
}

export class CurrencyUtils {
    constructor(private logger?: LoggerService) {}

    /**
     * ✅ Méthode principale de formatage sécurisé
     */
    static formatCurrency(
        amount: number | undefined | null,
        currency: string | undefined | null
    ): string {
        const safeAmount = CurrencyUtils.getSafeAmount(amount);
        const safeCurrency = CurrencyUtils.getSafeCurrency(currency);

        try {
            if (safeCurrency === 'XOF') {
                return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(safeAmount).replace('XOF', 'XOF');
            } else {
                return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(safeAmount);
            }
        } catch (error) {
            console.warn('Erreur formatage devise:', { amount: safeAmount, currency: safeCurrency });
            return CurrencyUtils.getFallbackFormat(safeAmount, safeCurrency);
        }
    }

    /**
     * ✅ Version avec options avancées
     */
    static formatCurrencyAdvanced(
        amount: number | undefined | null,
        currency: string | undefined | null,
        options: CurrencyFormatOptions = {}
    ): string {
        const {
            defaultCurrency = 'XOF',
            showZeroValues = true,
            customFormat = false,
            compactFormat = false
        } = options;

        const safeAmount = CurrencyUtils.getSafeAmount(amount);
        const safeCurrency = currency ? CurrencyUtils.getSafeCurrency(currency) : defaultCurrency;

        if (!showZeroValues && safeAmount === 0) {
            return '-';
        }

        if (compactFormat) {
            return CurrencyUtils.getCompactFormat(safeAmount, safeCurrency);
        }

        if (customFormat) {
            return CurrencyUtils.getCustomFormat(safeAmount, safeCurrency);
        }

        return CurrencyUtils.formatCurrency(safeAmount, safeCurrency);
    }

    /**
     * 🛡️ Validation du montant
     */
    private static getSafeAmount(amount: number | undefined | null): number {
        if (amount !== null && amount !== undefined && typeof amount === 'number' && !isNaN(amount)) {
            return amount;
        }

        if (typeof amount === 'string') {
            const parsed = parseFloat(amount);
            if (!isNaN(parsed)) return parsed;
        }

        return 0;
    }

    /**
     * 🛡️ Validation de la devise
     */
    private static getSafeCurrency(currency: string | undefined | null): 'XOF' | 'EUR' {
        if (!currency) return 'XOF';

        const normalized = currency.toString().trim().toUpperCase();

        if (['XOF', 'CFA', 'FCFA'].includes(normalized)) return 'XOF';
        if (['EUR', 'EURO', '€'].includes(normalized)) return 'EUR';

        return 'XOF';
    }

    /**
     * 🚨 Format de fallback
     */
    private static getFallbackFormat(amount: number, currency: 'XOF' | 'EUR'): string {
        const formatted = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: currency === 'XOF' ? 0 : 2,
            maximumFractionDigits: currency === 'XOF' ? 0 : 2
        }).format(amount);

        return `${formatted} ${currency}`;
    }

    /**
     * 📊 Format compact (1.25M XOF)
     */
    private static getCompactFormat(amount: number, currency: 'XOF' | 'EUR'): string {
        if (currency === 'XOF') {
            if (amount >= 1000000) {
                return `${(amount / 1000000).toFixed(1)}M XOF`;
            } else if (amount >= 1000) {
                return `${(amount / 1000).toFixed(0)}K XOF`;
            }
        }

        return CurrencyUtils.formatCurrency(amount, currency);
    }

    /**
     * 🎨 Format personnalisé
     */
    private static getCustomFormat(amount: number, currency: 'XOF' | 'EUR'): string {
        // Logique de format personnalisé selon vos besoins
        return CurrencyUtils.formatCurrency(amount, currency);
    }

    /**
     * 🔍 Validation d'un prix
     */
    static isValidPrice(price: number | undefined | null): boolean {
        return price !== null &&
            price !== undefined &&
            typeof price === 'number' &&
            !isNaN(price) &&
            price >= 0;
    }

    /**
     * 💱 Conversion XOF ↔ EUR
     */
    static convertCurrency(
        amount: number,
        fromCurrency: 'XOF' | 'EUR',
        toCurrency: 'XOF' | 'EUR',
        exchangeRate: number = 656
    ): number {
        if (fromCurrency === toCurrency) return amount;

        if (fromCurrency === 'XOF' && toCurrency === 'EUR') {
            return Math.round((amount / exchangeRate) * 100) / 100;
        } else {
            return Math.round(amount * exchangeRate);
        }
    }
}
