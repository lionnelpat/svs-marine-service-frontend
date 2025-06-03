// core/services/logger.service.ts
import { Injectable } from '@angular/core';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private logLevel = LogLevel.DEBUG; // Configuration selon l'environnement

    debug(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    info(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.INFO) {
            console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    warn(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.WARN) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    error(message: string, error?: any): void {
        if (this.logLevel <= LogLevel.ERROR) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
        }
    }
}
