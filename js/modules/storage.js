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
 * Verifica o espaço disponível no localStorage
 * @returns {boolean} True se há espaço disponível
 */
function hasLocalStorageSpace() {
    try {
        // Estimar o espaço disponível testando com uma string grande
        const testKey = '_test_storage_';
        const testSize = 500 * 1024; // 500KB
        const testString = new Array(testSize).join('a');
        
        localStorage.setItem(testKey, testString);
        localStorage.removeItem(testKey);
        
        return true;
    } catch (e) {
        console.warn('LocalStorage está cheio ou indisponível');
        return false;
    }
}

/**
 * Limpa dados antigos do localStorage quando excede a cota
 * @param {string} table Nome da tabela/chave a ser limpa
 */
function cleanupLocalStorage(table) {
    try {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        
        if (data.length > 0) {
            // Opção 1: Remover os registros mais antigos (25%)
            const removeCount = Math.max(1, Math.floor(data.length * 0.25));
            const newData = data.slice(removeCount);
            
            console.warn(`Removendo ${removeCount} registros antigos para liberar espaço`);
            localStorage.setItem(table, JSON.stringify(newData));
            
            // Opção 2: Se ainda não tiver espaço, comprimir imagens
            if (!hasLocalStorageSpace() && newData.some(item => item.localPhotos && item.localPhotos.length > 0)) {
                console.warn('Comprimindo imagens para economizar espaço');
                
                // Comprimir imagens reduzindo a qualidade
                newData.forEach(item => {
                    if (item.localPhotos && item.localPhotos.length > 0) {
                        item.localPhotos = compressPhotos(item.localPhotos);
                    }
                });
                
                localStorage.setItem(table, JSON.stringify(newData));
            }
        } else {
            // Se não há dados para limpar, limpe outros itens
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key !== table && key !== 'supabase-auth-token') {
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
        // Última opção: limpar tudo
        localStorage.clear();
        displayWarning('Armazenamento Reiniciado', 
                     'Seu armazenamento local foi limpo devido a limitações de espaço.');
    }
}

/**
 * Comprime fotos reduzindo a qualidade
 * @param {Array} photos Array de objetos de foto
 * @returns {Array} Array de fotos comprimidas
 */
function compressPhotos(photos) {
    try {
        return photos.map(photo => {
            if (!photo.data || !photo.data.startsWith('data:image')) {
                return photo;
            }
            
            // Comprimir apenas se for uma imagem base64
            const img = new Image();
            img.src = photo.data;
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Reduzir a resolução em 50%
            canvas.width = img.width * 0.5;
            canvas.height = img.height * 0.5;
            
            // Desenhar a imagem com tamanho reduzido
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Converter para JPEG com qualidade reduzida
            const compressedData = canvas.toDataURL('image/jpeg', 0.5);
            
            return {
                ...photo,
                data: compressedData
            };
        });
    } catch (error) {
        console.error('Erro ao comprimir fotos:', error);
        return photos; // Retornar originais em caso de erro
    }
}

/**
 * Salva dados no localStorage com tratamento de erros
 * @param {string} key Chave do localStorage
 * @param {any} data Dados a serem salvos
 */
function safeLocalStorageSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        
        if (error.name === 'QuotaExceededError') {
            cleanupLocalStorage(key);
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (retryError) {
                console.error('Falha mesmo após limpeza:', retryError);
                displayWarning('Limitação de Armazenamento', 
                             'Não foi possível salvar todos os dados localmente devido a limitações de espaço.');
            }
        }
    }
}

/**
 * Cliente Supabase fictício usando localStorage
 */
export function createMockSupabaseClient() {
    return {
        from: (table) => ({
            select: () => {
                try {
                    const data = JSON.parse(localStorage.getItem(table) || '[]');
                    return Promise.resolve({ data, error: null });
                } catch (error) {
                    console.error('Erro ao ler do localStorage:', error);
                    return Promise.resolve({ data: [], error: null });
                }
            },
            insert: (data) => {
                try {
                    if (!data.id) {
                        data.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
                    }
                    
                    let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                    tableData.push(data);
                    
                    safeLocalStorageSave(table, tableData);
                    
                    return Promise.resolve({ data: [data], error: null });
                } catch (error) {
                    console.error('Erro ao inserir no localStorage:', error);
                    return Promise.resolve({ data: [data], error: null });
                }
            },
            update: (data) => {
                try {
                    let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                    const index = tableData.findIndex(item => item.id === window.currentPersonId);
                    
                    if (index !== -1) {
                        tableData[index] = { ...tableData[index], ...data };
                        safeLocalStorageSave(table, tableData);
                    }
                    
                    return Promise.resolve({ data, error: null });
                } catch (error) {
                    console.error('Erro ao atualizar no localStorage:', error);
                    return Promise.resolve({ data, error: null });
                }
            },
            delete: () => {
                try {
                    let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                    tableData = tableData.filter(item => item.id !== window.currentPersonId);
                    safeLocalStorageSave(table, tableData);
                    
                    return Promise.resolve({ error: null });
                } catch (error) {
                    console.error('Erro ao excluir do localStorage:', error);
                    return Promise.resolve({ error: null });
                }
            },
            eq: (field, value) => {
                return {
                    select: () => {
                        try {
                            const tableData = JSON.parse(localStorage.getItem(table) || '[]');
                            const filteredData = tableData.filter(item => item[field] === value);
                            return Promise.resolve({ data: filteredData, error: null });
                        } catch (error) {
                            console.error('Erro ao consultar localStorage:', error);
                            return Promise.resolve({ data: [], error: null });
                        }
                    },
                    delete: () => {
                        try {
                            let tableData = JSON.parse(localStorage.getItem(table) || '[]');
                            tableData = tableData.filter(item => item[field] !== value);
                            safeLocalStorageSave(table, tableData);
                            
                            return Promise.resolve({ error: null });
                        } catch (error) {
                            console.error('Erro ao excluir do localStorage:', error);
                            return Promise.resolve({ error: null });
                        }
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
        safeLocalStorageSave('albumPeople', data || []);
        return data || [];
    } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        try {
            return JSON.parse(localStorage.getItem('albumPeople') || '[]');
        } catch (parseError) {
            console.error('Erro ao analisar dados locais:', parseError);
            return [];
        }
    }
}
