// toast.js - Sistema de notificações toast

import { getDOMElements } from '../modules/ui.js';

/**
 * Exibe uma notificação toast
 */
export function showToast(title, message, type = '') {
    const elements = getDOMElements();
    const toastId = Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" data-id="${toastId}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Tornar o toast visível após um pequeno atraso
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Adicionar event listener ao botão fechar
    toast.querySelector('.toast-close').addEventListener('click', function() {
        closeToast(this.dataset.id);
    });
    
    // Fechar automaticamente após 4 segundos
    setTimeout(() => {
        closeToast(toastId);
    }, 4000);
}

/**
 * Fecha uma notificação toast
 */
function closeToast(id) {
    const toast = document.querySelector(`.toast[data-id="${id}"]`);
    
    if (toast) {
        toast.classList.remove('active');
        
        // Remover do DOM após a animação completar
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}
