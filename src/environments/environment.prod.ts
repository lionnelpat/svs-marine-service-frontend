// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiBaseUrl: 'https://your-api-domain.com/api', // URL de production
    apiVersion: 'v1',

    // Configuration pour les requêtes HTTP
    httpTimeout: 30000,
    retryAttempts: 2,

    // Configuration pour les notifications
    toastDuration: 3000,

    // Configuration pour la pagination
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],

    // Configuration pour les uploads
    maxFileSize: 10485760,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

    // Configuration pour le cache
    cacheTimeout: 600000, // 10 minutes

    // Debug
    enableLogging: false
};
