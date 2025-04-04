// photoManager.js - Photo gallery management for multiple photos

import { showToast } from '../components/toast.js';
import { isGitHubPages, resolveModulePath, getPlaceholderImage } from './config.js';

// State to track photos for the current person
let currentPhotos = [];

// Configurações de compressão de imagem
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.7; // 70% de qualidade (bom equilíbrio entre tamanho e qualidade)

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
            // Comprimir a imagem antes de adicionar à galeria
            compressImage(e.target.result)
                .then(compressedImage => {
                    addPhotoToGallery(compressedImage);
                })
                .catch(error => {
                    console.error('Erro ao comprimir imagem:', error);
                    // Fallback para imagem original se a compressão falhar
                    addPhotoToGallery(e.target.result);
                });
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

/**
 * Comprime uma imagem para reduzir o tamanho do arquivo
 * @param {string} dataUrl - A imagem em formato base64 (data URL)
 * @returns {Promise<string>} - A imagem comprimida em formato base64
 */
async function compressImage(dataUrl) {
    return new Promise((resolve, reject) => {
        try {
            // Criar uma imagem para carregar o dataURL
            const img = new Image();
            img.onload = () => {
                // Calcular as novas dimensões mantendo a proporção
                let width = img.width;
                let height = img.height;

                // Redimensionar se a imagem for maior que o máximo permitido
                if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
                    const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                // Criar um canvas para desenhar a imagem redimensionada
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                // Desenhar a imagem no canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converter o canvas para dataURL com compressão
                const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

                // Limpar recursos
                canvas.width = 0;
                canvas.height = 0;

                resolve(compressedDataUrl);
            };

            img.onerror = () => {
                reject(new Error('Falha ao carregar a imagem para compressão'));
            };

            // Iniciar o carregamento da imagem
            img.src = dataUrl;
        } catch (error) {
            reject(error);
        }
    });
}
