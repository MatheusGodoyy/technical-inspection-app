import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Relatorio } from '../types';
import { STATUS_RELATORIO } from '../constants';

export const useRelatorios = () => {
    const [relatoriosAbertos, setRelatoriosAbertos] = useState<Relatorio[]>([]);
    const [relatoriosFinalizados, setRelatoriosFinalizados] = useState<Relatorio[]>([]);
    const [loading, setLoading] = useState(false);

    const carregarRelatorios = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await AsyncStorage.getItem('relatorios');

            if (!dados) {
                setRelatoriosAbertos([]);
                setRelatoriosFinalizados([]);
                return;
            }

            const lista: Relatorio[] = JSON.parse(dados);
            setRelatoriosAbertos(lista.filter((r) => r.status === STATUS_RELATORIO.ABERTO));
            setRelatoriosFinalizados(lista.filter((r) => r.status === STATUS_RELATORIO.FINALIZADO));
        } catch (erro) {
            console.error('Erro ao carregar relatórios:', erro);
            setRelatoriosAbertos([]);
            setRelatoriosFinalizados([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const salvarRelatorio = useCallback(async (relatorio: Relatorio) => {
        try {
            const dados = await AsyncStorage.getItem('relatorios');
            const lista: Relatorio[] = JSON.parse(dados || '[]');

            const index = lista.findIndex((r) => r.id === relatorio.id);
            if (index !== -1) {
                lista[index] = relatorio;
            } else {
                lista.push(relatorio);
            }

            await AsyncStorage.setItem('relatorios', JSON.stringify(lista));
            await carregarRelatorios();
        } catch (erro) {
            console.error('Erro ao salvar relatório:', erro);
            throw erro;
        }
    }, [carregarRelatorios]);

    const excluirRelatorio = useCallback(async (id: string) => {
        try {
            const dados = await AsyncStorage.getItem('relatorios');
            const lista: Relatorio[] = JSON.parse(dados || '[]');
            const novaLista = lista.filter((r) => r.id !== id);
            await AsyncStorage.setItem('relatorios', JSON.stringify(novaLista));
            await carregarRelatorios();
        } catch (erro) {
            console.error('Erro ao excluir relatório:', erro);
            throw erro;
        }
    }, [carregarRelatorios]);

    const reabrirRelatorio = useCallback(async (id: string) => {
        try {
            const dados = await AsyncStorage.getItem('relatorios');
            const lista: Relatorio[] = JSON.parse(dados || '[]');
            const novaLista = lista.map((r) =>
                r.id === id ? { ...r, status: STATUS_RELATORIO.ABERTO as const } : r
            );
            await AsyncStorage.setItem('relatorios', JSON.stringify(novaLista));
            await carregarRelatorios();
        } catch (erro) {
            console.error('Erro ao reabrir relatório:', erro);
            throw erro;
        }
    }, [carregarRelatorios]);

    return {
        relatoriosAbertos,
        relatoriosFinalizados,
        loading,
        carregarRelatorios,
        salvarRelatorio,
        excluirRelatorio,
        reabrirRelatorio,
    };
};
