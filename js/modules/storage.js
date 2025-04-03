// storage.js - Funções para manipulação de armazenamento e API

import { displayWarning } from './ui.js';

/**
 * Verifica se a configuração do Supabase está disponível
 */
export function checkSupabaseConfig() {
    return typeof SUPABASE_URL !== 'undefined' && 
           typeof SUPABASE_KEY !== 'undefined' && 
           SUPABASE_URL !== '__SUPABASE_URL__' && 
           SUPABASE_KEY !== '__SUPABASE_KEY__' &&
           SUPABASE_URL !== '' && 
           SUPABASE_KEY !== '';
}

/**
 * Cria cliente Supabase ou versão fictícia
 */
export function initializeSupabaseClient() {
    if (!checkSupabaseConfig()) {
        console.warn('⚠️ Configuração do Supabase inválida. Usando apenas armazenamento local.');
        displayWarning('Configuração de banco de dados ausente', 
                      'Operando apenas com armazenamento local. Dados serão perdidos ao limpar o navegador.');
        return createMockSupabaseClient();
    }
    
    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Cliente Supabase inicializado com sucesso");
        return client;
    } catch (error) {
        console.error("Erro ao inicializar cliente Supabase:", error);
        displayWarning('Erro de conexão', 
                      'Falha ao conectar com o banco de dados. Usando armazenamento local temporário.');
        return createMockSupabaseClient();
    }
}

/**
 * Cliente Supabase fictício usando localStorage
 */
export function createMockSupabaseClient() {
    return {
        from: (table) => ({
            select: () => {
                const data = JSON.parse(localStorage.getItem(table) || '[]');
                return Promise.resolve({ data, error: null });
            },
            insert: (data) => {
                if (!data.id) {
                    data.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
                }
                
                let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                tableData.push(data);
                localStorage.setItem(table, JSON.stringify(tableData));
                
                return Promise.resolve({ data: [data], error: null });
            },
            update: (data) => {
                let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                const index = tableData.findIndex(item => item.id === window.currentPersonId);
                
                if (index !== -1) {
                    tableData[index] = { ...tableData[index], ...data };
                    localStorage.setItem(table, JSON.stringify(tableData));
                }
                
                return Promise.resolve({ data, error: null });
            },
            delete: () => {
                let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                tableData = tableData.filter(item => item.id !== window.currentPersonId);
                localStorage.setItem(table, JSON.stringify(tableData));
                
                return Promise.resolve({ error: null });
            },
            eq: (field, value) => {
                return {
                    select: () => {
                        const tableData = JSON.parse(localStorage.getItem(table) || '[]');
                        const filteredData = tableData.filter(item => item[field] === value);
                        return Promise.resolve({ data: filteredData, error: null });
                    },
                    delete: () => {
                        let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                        tableData = tableData.filter(item => item[field] !== value);
                        localStorage.setItem(table, JSON.stringify(tableData));
                        
                        return Promise.resolve({ error: null });
                    }
                };
            }
        })
    };
}

/**
 * Carrega pessoas do banco de dados ou localStorage
 */
export async function loadPeopleFromDB(supabaseClient) {
    try {
        const { data, error } = await supabaseClient
            .from('people')
            .select('*');
            
        if (error) {
            console.error('Erro ao carregar dados:', error);
            return JSON.parse(localStorage.getItem('albumPeople') || '[]');
        }
        
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('albumPeople', JSON.stringify(data));
        return data || [];
    } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        return JSON.parse(localStorage.getItem('albumPeople') || '[]');
    }
}
