// config.js - Módulo centralizado de configuração e ambiente

/**
 * Verifica se a aplicação está rodando no GitHub Pages
 * @returns {boolean} Verdadeiro se estiver no GitHub Pages
 */
export function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Verifica se a aplicação está rodando em ambiente local
 * @returns {boolean} Verdadeiro se estiver em ambiente local
 */
export function isLocalEnvironment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
}

/**
 * Resolve o caminho para uma URL baseado no ambiente (GitHub Pages ou local)
 * @param {string} path - Caminho relativo
 * @returns {string} Caminho completo resolvido
 */
export function resolvePath(path) {
    // Adicionar prefixo para GitHub Pages
    return isGitHubPages() ? `/photo-album/${path}` : `./${path}`;
}

/**
 * Resolve caminhos de módulos para importação baseado no ambiente
 * @param {string} modulePath - Caminho do módulo
 * @returns {string} Caminho resolvido
 */
export function resolveModulePath(modulePath) {
    return isGitHubPages()
        ? `/photo-album/js/modules/${modulePath}`
        : `./${modulePath}`;
}

/**
 * Retorna uma URL para imagem placeholder que funciona em qualquer ambiente
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @returns {string} URL da imagem placeholder
 */
export function getPlaceholderImage(width = 400, height = 320) {
    return isGitHubPages()
        ? `https://placehold.co/${width}x${height}`
        : `/api/placeholder/${width}/${height}`;
}

/**
 * Verifica se a configuração do Supabase está disponível
 * @returns {boolean} Verdadeiro se a configuração do Supabase estiver disponível
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
 * Obtém a configuração do Supabase
 * @returns {Object} Objeto com URL e chave do Supabase
 */
export function getSupabaseConfig() {
    if (!checkSupabaseConfig()) {
        console.warn('⚠️ Configuração do Supabase inválida ou ausente');
        return { url: null, key: null };
    }
    
    return {
        url: SUPABASE_URL,
        key: SUPABASE_KEY
    };
}

// Constantes da aplicação
export const APP_VERSION = '2.5.0';
export const APP_ID = 'SYS-45A7-2025';
export const BASE_PATH = isGitHubPages() ? '/photo-album' : '';

// Configuração para usuário mock (apenas para desenvolvimento)
export const MOCK_USER = {
    email: 'demo@example.com',
    password: 'demo1234',
    userData: {
        name: 'Usuário Demo',
        role: 'demo'
    }
};
