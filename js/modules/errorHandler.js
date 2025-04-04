// errorHandler.js - Módulo centralizado para tratamento de erros

import { showToast } from '../components/toast.js';
import { displayWarning } from './ui.js';

/**
 * Tipos de erros
 */
export const ErrorType = {
    NETWORK: 'network',
    AUTH: 'auth',
    DATABASE: 'database',
    CAMERA: 'camera',
    STORAGE: 'storage',
    VALIDATION: 'validation',
    UNKNOWN: 'unknown'
};

/**
 * Registra um erro no console e exibe uma mensagem para o usuário
 * @param {Error} error - O objeto de erro
 * @param {string} context - O contexto onde o erro ocorreu
 * @param {string} type - O tipo de erro (use ErrorType)
 * @param {boolean} showToUser - Se deve mostrar o erro para o usuário
 */
export function handleError(error, context, type = ErrorType.UNKNOWN, showToUser = true) {
    // Registrar no console com contexto
    console.error(`Erro [${type}] em ${context}:`, error);
    
    // Determinar mensagem amigável baseada no tipo de erro
    let userMessage = 'Ocorreu um erro inesperado.';
    let toastType = 'error';
    
    switch (type) {
        case ErrorType.NETWORK:
            userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            break;
        case ErrorType.AUTH:
            userMessage = 'Erro de autenticação. Tente fazer login novamente.';
            break;
        case ErrorType.DATABASE:
            userMessage = 'Erro ao acessar o banco de dados. Os dados foram salvos localmente.';
            break;
        case ErrorType.CAMERA:
            userMessage = 'Não foi possível acessar a câmera. Verifique as permissões.';
            break;
        case ErrorType.STORAGE:
            userMessage = 'Erro ao salvar dados. Verifique o espaço disponível.';
            break;
        case ErrorType.VALIDATION:
            userMessage = 'Dados inválidos. Verifique as informações fornecidas.';
            toastType = 'warning';
            break;
        default:
            userMessage = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
    
    // Mostrar mensagem para o usuário se necessário
    if (showToUser) {
        showToast('Erro', userMessage, toastType);
    }
    
    // Retornar o erro para permitir encadeamento
    return error;
}

/**
 * Exibe um aviso persistente para o usuário
 * @param {string} title - Título do aviso
 * @param {string} message - Mensagem detalhada
 */
export function showWarning(title, message) {
    displayWarning(title, message);
}

/**
 * Tenta executar uma função e trata qualquer erro que ocorra
 * @param {Function} fn - A função a ser executada
 * @param {string} context - O contexto onde a função está sendo executada
 * @param {string} errorType - O tipo de erro esperado
 * @param {boolean} showToUser - Se deve mostrar erros para o usuário
 * @returns {Promise<any>} - O resultado da função ou null em caso de erro
 */
export async function tryCatch(fn, context, errorType = ErrorType.UNKNOWN, showToUser = true) {
    try {
        return await fn();
    } catch (error) {
        handleError(error, context, errorType, showToUser);
        return null;
    }
}
