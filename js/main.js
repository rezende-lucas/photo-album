// main.js - Ponto de entrada da aplicação

import { initializeSupabaseClient, loadPeopleFromDB } from './modules/storage.js';
import { getDOMElements } from './modules/ui.js';
import { setupEventListeners } from './modules/events.js';
import { renderPeople } from './modules/render.js';
import { requireAuth, getCurrentUser } from './modules/auth.js';
import { showToast } from './components/toast.js';
import { setupCameraButton } from './modules/people.js';

// Utilitário para determinar caminhos corretos baseado no ambiente (GitHub Pages ou local)
const isGitHubPages = window.location.hostname === 'rezende-lucas.github.io';
const BASE_PATH = isGitHubPages ? '/photo-album' : '';

// Função utilitária para resolver caminhos de imagens placeholder
export function getPlaceholderImage(width, height) {
    return isGitHubPages 
        ? `https://via.placeholder.com/${width}x${height}` 
        : `/api/placeholder/${width}/${height}`;
}

// Estado global da aplicação
export const state = {
    people: [],
    currentPersonId: null,
    currentView: 'grid',
    isDarkMode: false,
    supabaseClient: null,
    currentUser: null,
    basePath: BASE_PATH
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
    
    // Importar e inicializar a galeria de fotos dinamicamente
    // Usando importação dinâmica com caminho correto para resolver o erro 404
    try {
        const photoManagerModule = await import('./modules/photoManager.js');
        photoManagerModule.initPhotoGallery();
        console.log('Galeria de fotos inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao carregar módulo de gerenciamento de fotos:', error);
        showToast('Aviso', 'Funcionalidade de galeria de fotos indisponível.', 'warning');
    }
    
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
