export class AppError extends Error {
    constructor(
        public message: string,
        public code: string = 'UNKNOWN_ERROR',
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class StorageError extends AppError {
    constructor(message: string) {
        super(message, 'STORAGE_ERROR', 500);
        this.name = 'StorageError';
    }
}

export class PDFGenerationError extends AppError {
    constructor(message: string) {
        super(message, 'PDF_GENERATION_ERROR', 500);
        this.name = 'PDFGenerationError';
    }
}

export class SyncError extends AppError {
    constructor(message: string) {
        super(message, 'SYNC_ERROR', 500);
        this.name = 'SyncError';
    }
}
