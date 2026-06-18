export interface PDFGenerationResult {
    path_pdf: string;
    fileName: string;
    success: boolean;
    error?: string;
}
