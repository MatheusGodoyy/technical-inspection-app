// Environment variables
export const ENV = {
    DEBUG: __DEV__,
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    STORAGE_KEY_RELATORIOS: 'relatorios',
    STORAGE_KEY_SYNC_STATUS: 'syncStatus',
    DB_NAME: 'inspecoes.db',
    SYNC_INTERVAL: 5000, // 5 segundos
    REQUEST_TIMEOUT: 30000, // 30 segundos
} as const;
