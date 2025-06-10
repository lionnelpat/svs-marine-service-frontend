// src/environments/environment.ts
export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:8080/api', // Ajustez selon votre configuration backend
    apiVersion: 'v1',

    // Configuration pour les requêtes HTTP
    httpTimeout: 30000, // 30 secondes
    retryAttempts: 3,

    // Configuration pour les notifications
    toastDuration: 5000, // 5 secondes

    // Configuration pour la pagination
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],

    // Configuration pour les uploads (si nécessaire plus tard)
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

    // Configuration pour le cache
    cacheTimeout: 300000, // 5 minutes

    // Debug
    enableLogging: true
};
