// main.js - Ponto de entrada da aplicação

import { initializeSupabaseClient, loadPeopleFromDB } from './modules/storage.js';
import { getDOMElements } from './modules/ui.js';
import { setupEventListeners } from './modules/events.js';
import { renderPeople } from './modules/render.js';
import { requireAuth, getCurrentUser } from './modules/auth.js';
import { showToast } from './components/toast.js';
import { setupCameraButton } from './modules/people.js';

// Estado global da aplicação
export const state = {
    people: [],
    currentPersonId: null,
    currentView: 'grid',
    isDarkMode: false,
    supabaseClient: null,
    currentUser: null
};

// Função para atualizar o estado
export function setState(newState) {
    Object.assign(state, newState);
}

// Inicialização da aplicação
async function init() {
    // Verificar autenticação
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) return; // Redireciona para login.html
    
    const elements = getDOMElements();
    
    // Obter dados do usuário atual
    const { user } = await getCurrentUser();
    setState({ currentUser: user });
    
    // Atualizar UI com informações do usuário
    if (user && elements.userDisplayName) {
        elements.userDisplayName.textContent = user.user_metadata?.name || user.email;
    }
    
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
    
    // Configurar botão de câmera
    try {
        setupCameraButton();
        console.log('Configuração do botão de câmera concluída');
    } catch (error) {
        console.error('Erro ao configurar botão de câmera:', error);
        showToast('Aviso', 'Funcionalidade de câmera indisponível neste dispositivo.', 'warning');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
