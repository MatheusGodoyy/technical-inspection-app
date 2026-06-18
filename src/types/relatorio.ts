export type TipoInspecao = 'mecanica' | 'eletrica';
export type StatusRelatorio = 'aberto' | 'finalizado';
export type StatusEscopo = 'conforme' | 'nao_conforme' | null;

export interface Escopo {
    id: string;
    tituloItem: string;
    fotos: string[];
    status:
    | "conforme"
    | "nao_conforme"
    | "nao_aplicavel"
    | null;
    observacao: string;
    recomendacao?: string;
    grupo?: string;
    exigeFoto?: boolean;
}

export interface Relatorio {
    id: string;
    status: StatusRelatorio;
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
    criadoEm?: number;
    atualizadoEm?: number;
}

export interface RelatorioFinalizadoSQLite {
    id: number;
    titulo_inspecao: string;
    tipo_inspecao: TipoInspecao;
    unidade: string;
    data_inspecao: string;
    proxima_inspecao: string;
    responsavel: string;
    equipamento_fn: string;
    equipamento_nome: string;
    equipamento_local: string;
    equipamento_plano: string;
    equipamento_lista_tarefas: string;
    itens_conforme: number;
    itens_nao_conforme: number;
    total_itens: number;
    escopos: string; // JSON stringified
    path_pdf: string;
    status_sync: 'pending' | 'synced' | 'error';
    criadoEm?: number;
    sincronizadoEm?: number | null;
}
