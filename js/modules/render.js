// render.js - Funções de renderização da interface

import { getDOMElements } from './ui.js';
import { formatAddress, generateRegistrationId } from './utils.js';
import { state } from '../main.js';

/**
 * Verifica se a aplicação está sendo executada no GitHub Pages
 * @returns {boolean} Verdadeiro se estiver no GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Retorna URL da imagem placeholder compatível com o ambiente atual
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @returns {string} URL da imagem
 */
function getPlaceholderImage(width = 400, height = 320) {
    return isGitHubPages() 
        ? `https://placehold.co/${width}x${height}` 
        : `/api/placeholder/${width}/${height}`;
}

/**
 * Função auxiliar para formatar informações de filiação
 * @param {Object} person - Dados da pessoa
 * @returns {string} Texto formatado com informações de filiação
 */
function formatFiliation(person) {
    // Prioriza os novos campos, mas tem fallback para filiation
    if (person.mother && person.father) {
        return `${person.mother} e ${person.father}`;
    } else if (person.mother) {
        return person.mother;
    } else if (person.father) {
        return person.father;
    } else if (person.filiation) {
        return person.filiation;
    } else {
        return 'Sem informação de filiação';
    }
}

/**
 * Renderiza pessoas na visualização atual
 */
export function renderPeople(filteredPeople = null) {
    const elements = getDOMElements();
    const peopleToRender = filteredPeople || state.people;
    
    // Mostrar estado vazio se não há pessoas
    if (peopleToRender.length === 0) {
        if (elements.photoGrid) elements.photoGrid.style.display = 'none';
        if (elements.photoList) elements.photoList.style.display = 'none';
        if (elements.emptyState) elements.emptyState.style.display = 'flex';
        return;
    }
    
    // Esconder estado vazio
    if (elements.emptyState) elements.emptyState.style.display = 'none';
    
    // Renderizar com base na visualização atual
    if (state.currentView === 'grid') {
        renderGridView(peopleToRender);
    } else {
        renderListView(peopleToRender);
    }
}

/**
 * Renderiza visualização em grade
 */
export function renderGridView(peopleArray) {
    const elements = getDOMElements();
    
    if (!elements.photoGrid) {
        console.error('Elemento photoGrid não encontrado');
        return;
    }
    
    elements.photoGrid.style.display = 'grid';
    if (elements.photoList) elements.photoList.style.display = 'none';
    
    elements.photoGrid.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        // Get the first photo or use placeholder
        // Usar os dados da foto principal ou da primeira foto local
        const mainPhoto = person.localPhotos && person.localPhotos.length > 0 
            ? person.localPhotos[0].data 
            : (person.photo || getPlaceholderImage(400, 320));
        
        // Calculate additional photos indicator
        const additionalPhotos = (person.localPhotos?.length || 0) - 1;
        const photoIndicator = additionalPhotos > 0 
            ? `<div class="photo-counter">+${additionalPhotos}</div>` 
            : '';
            
        const card = document.createElement('div');
        card.className = 'person-card fade-in';
        card.dataset.id = person.id;
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Formatação de filiação usando a nova função auxiliar
        const filiationText = formatFiliation(person);
        
        card.innerHTML = `
            <div class="card-img">
                <img src="${mainPhoto}" alt="${person.name}">
                ${photoIndicator}
            </div>
            <div class="card-content">
                <h3 class="person-name">
                    ${person.name}
                </h3>
                <p class="person-info">
                    <i class="fas fa-user-friends info-icon"></i> 
                    ${filiationText}
                </p>
                <p class="person-info">
                    <i class="fas fa-map-marker-alt info-icon"></i> 
                    ${formatAddress(person.address)}
                </p>
                <div class="card-controls">
                    <button class="card-btn edit-btn" data-id="${person.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="card-btn delete-btn" data-id="${person.id}">
                        <i class="fas fa-trash-alt"></i> Deletar
                    </button>
                </div>
            </div>
        `;
        
        elements.photoGrid.appendChild(card);
    });
}

/**
 * Renderiza visualização em lista
 */
export function renderListView(peopleArray) {
    const elements = getDOMElements();
    
    if (!elements.photoList) {
        console.error('Elemento photoList não encontrado');
        return;
    }
    
    if (elements.photoGrid) elements.photoGrid.style.display = 'none';
    elements.photoList.style.display = 'flex';
    
    elements.photoList.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        // Get the first photo or use placeholder
        // Usar os dados da foto principal ou da primeira foto local
        const mainPhoto = person.localPhotos && person.localPhotos.length > 0 
            ? person.localPhotos[0].data 
            : (person.photo || getPlaceholderImage(400, 320));
        
        // Calculate additional photos indicator
        const additionalPhotos = (person.localPhotos?.length || 0) - 1;
        const photoIndicator = additionalPhotos > 0 
            ? `<div class="photo-counter">+${additionalPhotos}</div>` 
            : '';
        
        // Formatação de filiação usando a nova função auxiliar
        const filiationText = formatFiliation(person);
            
        const listItem = document.createElement('div');
        listItem.className = 'list-item fade-in';
        listItem.dataset.id = person.id;
        listItem.style.animationDelay = `${index * 0.05}s`;
        
        // Adiciona informações de CPF/RG se disponíveis
        const identificationInfo = person.CPF || person.RG ? `
            <p class="person-info">
                <i class="fas fa-id-card info-icon"></i> 
                ${person.CPF ? `CPF: ${person.CPF}` : ''}
                ${person.CPF && person.RG ? ' | ' : ''}
                ${person.RG ? `RG: ${person.RG}` : ''}
            </p>
        ` : '';
        
        listItem.innerHTML = `
            <div class="list-img">
                <img src="${mainPhoto}" alt="${person.name}">
                ${photoIndicator}
            </div>
            <div class="list-content">
                <h3 class="person-name">${person.name}</h3>
                <p class="person-info">
                    <i class="fas fa-user-friends info-icon"></i> 
                    ${filiationText}
                </p>
                ${identificationInfo}
                <p class="person-info">
                    <i class="fas fa-map-marker-alt info-icon"></i> 
                    ${formatAddress(person.address)}
                </p>
            </div>
            <div class="list-actions">
                <button class="list-btn" data-id="${person.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="list-btn delete-btn" data-id="${person.id}" title="Deletar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        elements.photoList.appendChild(listItem);
    });
}
