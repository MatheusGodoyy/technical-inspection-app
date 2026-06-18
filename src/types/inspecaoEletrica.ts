export type StatusEletrico = 'conforme' | 'nao_conforme' | 'nao_aplicavel';

export interface EvidenciaFotografica {
    obrigatoria: boolean;
    uri: string | null;
}

export interface ItemInspecaoEletrica {
    id: string;
    descricao: string;
    status: StatusEletrico | null;
    observacao: string;
    foto?: EvidenciaFotografica;
}

export interface RelatorioEletrico {
    id: string;
    status: 'aberto' | 'finalizado';
    tituloInspecao: string;
    tipoInspecao: 'eletrica';
    unidade: string;
    data1: string;
    data2: string;
    responsavel: string;
    fnEquipamento: string;
    nomeEquipamento: string;
    localInstalacao: string;
    plano: string;
    listaTarefas: string;
    itens: ItemInspecaoEletrica[];
    assinatura: string | null;
    criadoEm?: number;
    atualizadoEm?: number;
}
