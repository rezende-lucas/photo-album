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
        ? `https://via.placeholder.com/${width}x${height}` 
        : `/api/placeholder/${width}/${height}`;
}

/**
 * Renderiza pessoas na visualização atual
 */
export function renderPeople(filteredPeople = null) {
    const elements = getDOMElements();
    const peopleToRender = filteredPeople || state.people;
    
    // Mostrar estado vazio se não há pessoas
    if (peopleToRender.length === 0) {
        elements.photoGrid.style.display = 'none';
        elements.photoList.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        return;
    }
    
    // Esconder estado vazio
    elements.emptyState.style.display = 'none';
    
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
    elements.photoGrid.style.display = 'grid';
    elements.photoList.style.display = 'none';
    
    elements.photoGrid.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        // Get the first photo or use placeholder
        // Corrigido para usar função getPlaceholderImage para compatibilidade com GitHub Pages
        const mainPhoto = person.photos && person.photos.length > 0 
            ? person.photos[0].data 
            : (person.photo || getPlaceholderImage(400, 320));
        
        // Calculate additional photos indicator
        const additionalPhotos = (person.photos?.length || 0) - 1;
        const photoIndicator = additionalPhotos > 0 
            ? `<div class="photo-counter">+${additionalPhotos}</div>` 
            : '';
            
        const card = document.createElement('div');
        card.className = 'person-card fade-in';
        card.dataset.id = person.id;
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Generate random tag type for display
        const tagTypes = ['', 'danger', 'warning', 'success'];
        const tagType = tagTypes[Math.floor(Math.random() * tagTypes.length)];
        const tagText = tagType === 'danger' ? 'ATENÇÃO' : 
                        tagType === 'warning' ? 'VERIFICAR' : 
                        tagType === 'success' ? 'LIBERADO' : '';
        
        card.innerHTML = `
            <div class="card-id">
                <div class="id-label">ID</div>
                <div class="id-number">${generateRegistrationId(person.id)}</div>
            </div>
            ${tagText ? `<div class="card-tag ${tagType}">${tagText}</div>` : ''}
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
                    ${person.filiation || 'Sem informação de filiação'}
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
    elements.photoGrid.style.display = 'none';
    elements.photoList.style.display = 'flex';
    
    elements.photoList.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        // Get the first photo or use placeholder
        // Corrigido para usar função getPlaceholderImage para compatibilidade com GitHub Pages
        const mainPhoto = person.photos && person.photos.length > 0 
            ? person.photos[0].data 
            : (person.photo || getPlaceholderImage(400, 320));
        
        // Calculate additional photos indicator
        const additionalPhotos = (person.photos?.length || 0) - 1;
        const photoIndicator = additionalPhotos > 0 
            ? `<div class="photo-counter">+${additionalPhotos}</div>` 
            : '';
            
        const listItem = document.createElement('div');
        listItem.className = 'list-item fade-in';
        listItem.dataset.id = person.id;
        listItem.style.animationDelay = `${index * 0.05}s`;
        
        listItem.innerHTML = `
            <div class="list-img">
                <img src="${mainPhoto}" alt="${person.name}">
                ${photoIndicator}
            </div>
            <div class="list-content">
                <div class="list-id">${generateRegistrationId(person.id)}</div>
                <h3 class="person-name">${person.name}</h3>
                <p class="person-info">
                    <i class="fas fa-user-friends info-icon"></i> 
                    ${person.filiation || 'Sem informação de filiação'}
                </p>
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
