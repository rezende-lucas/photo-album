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
        ? `https://placehold.co/${width}x${height}` 
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
    try {
        // Verificar autenticação
        const isAuthenticated = await requireAuth();
        if (!isAuthenticated) return;
        
        const elements = getDOMElements();
        
        // Verificar se elementos existem antes de usá-los
        if (!elements.body) {
            console.error('Elemento body não encontrado');
            return;
        }
        
        const { user } = await getCurrentUser();
        setState({ currentUser: user });
        
        if (user && elements.userDisplayName) {
            elements.userDisplayName.textContent = user.user_metadata?.name || user.email;
        }
        
        // Verificar tema
        state.isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (state.isDarkMode && elements.body && elements.themeToggle) {
            elements.body.classList.add('light-mode');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Inicializar cliente Supabase
        state.supabaseClient = initializeSupabaseClient();
        
        // Carregar dados
        try {
            state.people = await loadPeopleFromDB(state.supabaseClient);
            
            // Migrar dados antigos para o novo formato
            state.people = state.people.map(person => {
                // Se já existe uma estrutura para fotos múltiplas, manter
                if (person.localPhotos) {
                    return person;
                }
                
                // Caso contrário, criar estrutura
                if (person.photo) {
                    person.localPhotos = [{
                        id: 'legacy',
                        data: person.photo,
                        dateAdded: new Date().toISOString()
                    }];
                } else {
                    person.localPhotos = [];
                }
                
                return person;
            });
            
            renderPeople();
        } catch (error) {
            console.error('Falha ao carregar dados:', error);
            // Recuperar do localStorage apenas se falhar
            const localData = localStorage.getItem('albumPeople');
            if (localData) {
                try {
                    state.people = JSON.parse(localData);
                    renderPeople();
                } catch (parseError) {
                    console.error('Falha ao analisar dados locais:', parseError);
                    state.people = [];
                }
            } else {
                state.people = [];
            }
        }
        
        // Configurar listeners de eventos
        setupEventListeners();
        
        // Importar e inicializar a galeria de fotos dinamicamente
        try {
            const photoManagerModule = await import('./modules/photoManager.js');
            if (typeof photoManagerModule.initPhotoGallery === 'function') {
                photoManagerModule.initPhotoGallery();
                console.log('Galeria de fotos inicializada com sucesso');
            }
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
    } catch (error) {
        console.error('Erro na inicialização da aplicação:', error);
        showToast('Erro', 'Falha ao inicializar a aplicação. Tente recarregar a página.', 'error');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
