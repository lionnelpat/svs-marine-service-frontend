import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const SVSTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#1e40af',
                    inverseColor: '#ffffff',
                    hoverColor: '#1d4ed8',
                    activeColor: '#1e3a8a'
                },
                highlight: {
                    background: '#06b6d4',
                    focusBackground: '#0891b2',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                },
                surface: {
                    0: '#ffffff',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                }
            },
            dark: {
                primary: {
                    color: '#3b82f6',
                    inverseColor: '#ffffff',
                    hoverColor: '#60a5fa',
                    activeColor: '#2563eb'
                },
                highlight: {
                    background: '#06b6d4',
                    focusBackground: '#22d3ee',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                },
                surface: {
                    0: '#0f172a',
                    50: '#1e293b',
                    100: '#334155',
                    200: '#475569',
                    300: '#64748b',
                    400: '#94a3b8',
                    500: '#cbd5e1',
                    600: '#e2e8f0',
                    700: '#f1f5f9',
                    800: '#f8fafc',
                    900: '#ffffff',
                    950: '#ffffff'
                }
            }
        }
    }
});
