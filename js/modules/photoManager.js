// photoManager.js - Photo gallery management for multiple photos

import { showToast } from '../components/toast.js';

// State to track photos for the current person
let currentPhotos = [];

/**
 * Checks if the app is running on GitHub Pages
 * @returns {boolean} True if running on GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Resolves the correct module path based on the current environment
 * @param {string} modulePath - The relative module path
 * @returns {string} The correctly resolved path
 */
function resolveModulePath(modulePath) {
    if (isGitHubPages()) {
        return `/photo-album/js/modules/${modulePath}`;
    }
    return `./${modulePath}`;
}

/**
 * Gets placeholder image URL that works in any environment
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} URL for the placeholder image
 */
function getPlaceholderImage(width = 400, height = 320) {
    return isGitHubPages() 
        ? `https://placehold.co/${width}x${height}` 
        : `/api/placeholder/${width}/${height}`;
}

/**
 * Initialize the photo gallery component
 */
export function initPhotoGallery() {
    const fileInput = document.getElementById('photo-file-input');
    const cameraBtn = document.getElementById('camera-btn');
    const photosGallery = document.getElementById('photos-gallery');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    
    // Verificar se os elementos existem
    if (!photosGallery || !photoPlaceholder) {
        console.warn('Elementos da galeria de fotos não encontrados');
        return;
    }
    
    // Set up file input
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Set up camera button
    if (cameraBtn) {
        // Import camera module dynamically with the correct path
        const cameraModulePath = resolveModulePath('camera.js');
        
        import(cameraModulePath)
            .then(({ getCameraManager }) => {
                cameraBtn.addEventListener('click', () => {
                    try {
                        const cameraManager = getCameraManager();
                        
                        // Open camera with callback to process the photo
                        cameraManager.openCamera((imageData) => {
                            // Add the captured photo to our collection
                            addPhotoToGallery(imageData);
                        });
                    } catch (error) {
                        console.error('Erro ao inicializar câmera:', error);
                        showToast('Erro', 'Não foi possível inicializar a câmera.', 'error');
                    }
                });
            })
            .catch(error => {
                console.error('Error loading camera module:', error);
                if (cameraBtn) cameraBtn.style.display = 'none';
                showToast('Aviso', 'Funcionalidade de câmera indisponível neste dispositivo.', 'warning');
            });
    }
}

/**
 * Handle file selection from the device
 */
function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each selected file
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Add the loaded image to our gallery
            addPhotoToGallery(e.target.result);
        };
        
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            showToast('Erro', 'Não foi possível processar a imagem selecionada.', 'error');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Reset file input to allow selecting the same files again
    event.target.value = '';
}

/**
 * Add a photo to the gallery with preview
 */
function addPhotoToGallery(imageData) {
    const photosGallery = document.getElementById('photos-gallery');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    
    if (!photosGallery) {
        console.error('Elemento da galeria de fotos não encontrado');
        return;
    }
    
    // Hide placeholder when we have photos
    if (photoPlaceholder) {
        photoPlaceholder.style.display = 'none';
    }
    
    // Create a unique ID for this photo
    const photoId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // Add to our state
    currentPhotos.push({
        id: photoId,
        data: imageData,
        dateAdded: new Date().toISOString()
    });
    
    // Create the photo preview element
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.dataset.id = photoId;
    photoElement.innerHTML = `
        <img src="${imageData}" alt="Preview">
        <button class="photo-remove" title="Remover foto">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add removal functionality
    const removeBtn = photoElement.querySelector('.photo-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            // Remove from state
            currentPhotos = currentPhotos.filter(photo => photo.id !== photoId);
            
            // Remove preview
            photoElement.remove();
            
            // Show placeholder if no photos left
            if (currentPhotos.length === 0 && photoPlaceholder) {
                photoPlaceholder.style.display = 'flex';
            }
        });
    }
    
    // Add to DOM
    photosGallery.appendChild(photoElement);
}

/**
 * Set up the gallery with existing photos when editing
 */
export function setExistingPhotos(photos) {
    // Clear current state
    currentPhotos = [];
    
    // Clear gallery
    const photosGallery = document.getElementById('photos-gallery');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    
    if (!photosGallery || !photoPlaceholder) {
        console.error('Elementos da galeria não encontrados');
        return;
    }
    
    try {
        // Clone the placeholder to make sure we don't lose it
        const newPlaceholder = photoPlaceholder.cloneNode(true);
        
        // Clear the gallery
        photosGallery.innerHTML = '';
        
        // Add the placeholder back
        photosGallery.appendChild(newPlaceholder);
        
        // If no photos, show placeholder and return
        if (!photos || photos.length === 0) {
            photoPlaceholder.style.display = 'flex';
            return;
        }
        
        // Hide placeholder
        photoPlaceholder.style.display = 'none';
        
        // Add each photo to the gallery
        photos.forEach(photo => {
            if (photo && photo.data) {
                addPhotoToGallery(photo.data);
            }
        });
    } catch (error) {
        console.error('Erro ao configurar fotos existentes:', error);
        photoPlaceholder.style.display = 'flex';
    }
}

/**
 * Get the current photos for saving
 */
export function getCurrentPhotos() {
    return [...currentPhotos];
}
