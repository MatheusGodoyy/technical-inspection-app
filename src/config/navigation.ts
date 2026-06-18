import { ROUTES } from '../constants';

export const navigationConfig = {
    screens: {
        [ROUTES.LISTA]: {
            title: 'Relatórios',
        },
        [ROUTES.SELECIONAR_TIPO]: {
            title: 'Tipo de Inspeção',
        },
        [ROUTES.FORMULARIO_MECANICO]: {
            title: 'Inspeção Mecânica/Civil',
            options: { headerBackVisible: false },
        },
        [ROUTES.FORMULARIO_ELETRICO]: {
            title: 'Inspeção Elétrica',
            options: { headerBackVisible: false },
        },
    },
} as const;
