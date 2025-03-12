// utils.js - Funções utilitárias gerais

/**
 * Gera um ID UUID v4 compatível com Supabase
 */
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Formata um ID para exibição como ID de registro
 */
export function generateRegistrationId(personId) {
    // Para UUIDs, extrair a primeira parte
    const idPart = personId.split('-')[0].toUpperCase();
    return `REG-${idPart}`;
}

/**
 * Formata endereço para exibição
 */
export function formatAddress(address) {
    if (!address) return 'ENDEREÇO NÃO INFORMADO';
    
    // Truncar endereços longos
    if (address.length > 30) {
        return address.substring(0, 30) + '...';
    }
    
    return address;
}

/**
 * Formata data
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Converte valores vazios para null
 */
export function emptyToNull(value) {
    return value === "" ? null : value;
}
