// photoManager.js - Photo gallery management for multiple photos

import { showToast } from '../components/toast.js';

// State to track photos for the current person
let currentPhotos = [];

/**
 * Initialize the photo gallery component
 */
export function initPhotoGallery() {
    const fileInput = document.getElementById('photo-file-input');
    const cameraBtn = document.getElementById('camera-btn');
    const photosGallery = document.getElementById('photos-gallery');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    
    // Set up file input for selecting photos
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Set up camera button
    if (cameraBtn) {
        // Import camera module dynamically
        import('./camera.js').then(({ getCameraManager }) => {
            cameraBtn.addEventListener('click', () => {
                const cameraManager = getCameraManager();
                
                // Open camera with callback to process the photo
                cameraManager.openCamera((imageData) => {
                    // Add the captured photo to our collection
                    addPhotoToGallery(imageData);
                });
            });
        }).catch(error => {
            console.error('Error loading camera module:', error);
            cameraBtn.style.display = 'none';
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
    
    if (photosGallery) {
        // Keep only the placeholder
        const newPlaceholder = photoPlaceholder.cloneNode(true);
        photosGallery.innerHTML = '';
        photosGallery.appendChild(newPlaceholder);
    }
    
    // If no photos, show placeholder and return
    if (!photos || photos.length === 0) {
        if (photoPlaceholder) {
            photoPlaceholder.style.display = 'flex';
        }
        return;
    }
    
    // Hide placeholder
    if (photoPlaceholder) {
        photoPlaceholder.style.display = 'none';
    }
    
    // Add each photo to the gallery
    photos.forEach(photo => {
        addPhotoToGallery(photo.data);
    });
}

/**
 * Get the current photos for saving
 */
export function getCurrentPhotos() {
    return [...currentPhotos];
}
