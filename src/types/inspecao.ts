import { Escopo, TipoInspecao } from './relatorio';

export interface DadosInspecao {
    tituloInspecao: string;
    tipoInspecao: TipoInspecao;
    unidade: string;
    data1: string;
    data2: string;
    responsavel: string;
    fnEquipamento: string;
    nomeEquipamento: string;
    localInstalacao: string;
    plano: string;
    listaTarefas: string;
    escopos: Escopo[];
    assinatura: string | null;
    observacaoGeral?: string;

}

export interface PDFGenerationParams extends DadosInspecao {
    // Campos adicionais necessários para geração de PDF
}

export interface PDFGenerationResult {
    path_pdf: string;
    fileName: string;
    success: boolean;
    error?: string;
}
