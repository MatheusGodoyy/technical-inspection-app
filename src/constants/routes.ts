export const ROUTES = {
  LISTA: 'Lista',
  SELECIONAR_TIPO: 'SelecionarTipo',
  FORMULARIO_MECANICO: 'Formulario',
  FORMULARIO_ELETRICO: 'FormularioEletrico',
} as const;

export const TIPO_INSPECAO = {
  MECANICA: 'mecanica',
  ELETRICA: 'eletrica',
} as const;

export const STATUS_RELATORIO = {
  ABERTO: 'aberto',
  FINALIZADO: 'finalizado',
} as const;

export const STATUS_ESCOPO = {
  CONFORME: 'conforme',
  NAO_CONFORME: 'nao_conforme',
  NAO_APLICAVEL: 'nao_aplicavel',
  PENDENTE: null,
} as const;

export const STATUS_SYNC = {
  PENDING: 'pending',
  SYNCED: 'synced',
  ERROR: 'error',
} as const;
