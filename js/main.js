// main.js - Ponto de entrada da aplicação

import { initializeSupabaseClient, loadPeopleFromDB } from './modules/storage.js';
import { getDOMElements } from './modules/ui.js';
import { setupEventListeners } from './modules/events.js';
import { renderPeople } from './modules/render.js';

// Estado global da aplicação
export const state = {
    people: [],
    currentPersonId: null,
    currentView: 'grid',
    isDarkMode: false,
    supabaseClient: null
};

// Função para atualizar o estado
export function setState(newState) {
    Object.assign(state, newState);
}

// Inicialização da aplicação
async function init() {
    const elements = getDOMElements();
    
    // Verificar tema escuro
    state.isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (state.isDarkMode) {
        elements.body.classList.add('light-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Inicializar cliente Supabase
    state.supabaseClient = initializeSupabaseClient();
    
    // Carregar dados
    try {
        state.people = await loadPeopleFromDB(state.supabaseClient);
        renderPeople();
    } catch (error) {
        console.error('Falha ao carregar dados:', error);
        state.people = JSON.parse(localStorage.getItem('albumPeople') || '[]');
        renderPeople();
    }
    
    // Configurar listeners de eventos
    setupEventListeners();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
