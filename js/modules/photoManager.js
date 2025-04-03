// photoManager.js - Photo gallery management for multiple photos

import { showToast } from '../components/toast.js';
import { getOCRManager, applyDataToForm } from './ocr.js';

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
    
    // Add OCR button to photo controls
    addOCRButton();
    
    // Pre-initialize OCR engine for faster response later
    try {
        setTimeout(() => {
            const ocrManager = getOCRManager();
            ocrManager.initialize().catch(err => {
                console.warn('Pré-inicialização do OCR falhou:', err);
            });
        }, 3000); // Delay by 3 seconds to let the page load first
    } catch (e) {
        console.warn('Não foi possível pré-inicializar o OCR:', e);
    }
}

/**
 * Add OCR button to the photo controls
 */
function addOCRButton() {
    const photoControls = document.querySelector('.photo-controls');
    if (!photoControls) return;
    
    // Check if button already exists
    if (document.getElementById('ocr-btn')) return;
    
    // Create OCR button
    const ocrButton = document.createElement('button');
    ocrButton.type = 'button';
    ocrButton.className = 'photo-btn ocr-btn';
    ocrButton.id = 'ocr-btn';
    ocrButton.innerHTML = '<i class="fas fa-file-alt"></i> Extrair Texto';
    ocrButton.addEventListener('click', handleOCRExtraction);
    
    // Add button to controls
    photoControls.appendChild(ocrButton);
}

/**
 * Update OCR progress UI
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} status - Current status text
 */
function updateOCRProgress(percent, status) {
    const progressContainer = document.getElementById('ocr-progress-container');
    const progressBar = document.getElementById('ocr-progress-bar');
    const progressLabel = document.getElementById('ocr-progress-label');
    
    if (!progressContainer || !progressBar || !progressLabel) return;
    
    // Show progress container if hidden
    progressContainer.style.display = 'block';
    
    // Update progress bar width
    progressBar.style.width = `${percent}%`;
    
    // Update status text
    progressLabel.textContent = status || `Processando OCR (${percent}%)`;
}

/**
 * Hide OCR progress UI
 */
function hideOCRProgress() {
    const progressContainer = document.getElementById('ocr-progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

/**
 * Handle OCR text extraction from selected photo
 */
async function handleOCRExtraction() {
    if (currentPhotos.length === 0) {
        showToast('Aviso', 'Adicione uma foto para extrair texto.', 'warning');
        return;
    }
    
    // Get the most recent photo (likely to be the document)
    const photo = currentPhotos[currentPhotos.length - 1];
    
    // Get the OCR button and add processing state
    const ocrBtn = document.getElementById('ocr-btn');
    if (ocrBtn) {
        ocrBtn.classList.add('processing');
        ocrBtn.disabled = true;
        ocrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    }
    
    // Show progress indicator
    updateOCRProgress(0, 'Iniciando OCR...');
    
    try {
        // Get OCR manager
        const ocrManager = getOCRManager();
        
        // Progress callback
        const updateProgress = (progress, status) => {
            updateOCRProgress(progress, status);
        };
        
        // Extract data from the image
        const result = await ocrManager.extractFormData(photo.data, updateProgress);
        
        // Hide progress indicator
        hideOCRProgress();
        
        // Reset OCR button
        if (ocrBtn) {
            ocrBtn.classList.remove('processing');
            ocrBtn.disabled = false;
            ocrBtn.innerHTML = '<i class="fas fa-file-alt"></i> Extrair Texto';
        }
        
        if (result.success) {
            // Apply extracted data to the form
            applyDataToForm(result.data, result.data.confidenceScores);
            
            // Show success toast
            showToast('Sucesso', 'Texto extraído e campos preenchidos.', 'success');
            
            // Create a detailed results modal for review
            showOCRResultsModal(result.data, result.originalText);
        } else {
            showToast('Erro', `Falha na extração: ${result.error || 'Erro desconhecido'}`, 'error');
        }
    } catch (error) {
        console.error('OCR extraction error:', error);
        hideOCRProgress();
        
        // Reset OCR button
        if (ocrBtn) {
            ocrBtn.classList.remove('processing');
            ocrBtn.disabled = false;
            ocrBtn.innerHTML = '<i class="fas fa-file-alt"></i> Extrair Texto';
        }
        
        showToast('Erro', 'Ocorreu um erro durante a extração de texto. Tente novamente.', 'error');
    }
}

/**
 * Show a modal with the OCR results for review
 * @param {Object} data - Extracted data fields
 * @param {string} originalText - The original raw extracted text
 */
function showOCRResultsModal(data, originalText) {
    // Create modal element
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.id = 'ocr-results-modal';
    
    // Create modal HTML structure
    modalBackdrop.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <div>
                    <h2 class="modal-title">
                        <i class="fas fa-file-alt"></i> Resultados da Extração de Texto
                    </h2>
                    <div class="modal-subtitle">Revise os dados extraídos</div>
                </div>
                <button class="close-btn" id="close-ocr-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="ocr-alert info">
                    <i class="fas fa-info-circle"></i>
                    Os campos foram preenchidos automaticamente com base no texto extraído. 
                    Verifique as informações e corrija-as se necessário antes de salvar.
                </div>
                
                <div class="ocr-results-container">
                    <div class="ocr-extracted-fields">
                        <h3>Dados Extraídos</h3>
                        <div class="ocr-field-list">
                            ${Object.entries(data)
                                .filter(([key]) => key !== 'confidenceScores')
                                .map(([key, value]) => {
                                    if (!value) return '';
                                    const confidence = data.confidenceScores && data.confidenceScores[key] 
                                        ? data.confidenceScores[key] 
                                        : 'low';
                                    return `
                                        <div class="ocr-field ${confidence}-confidence">
                                            <div class="ocr-field-label">${key}:</div>
                                            <div class="ocr-field-value">${value}</div>
                                            <div class="ocr-confidence-indicator" title="Confiança: ${confidence}">
                                                <i class="fas fa-${confidence === 'high' ? 'check-circle' : confidence === 'medium' ? 'question-circle' : 'exclamation-circle'}"></i>
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                    <div class="ocr-original-text">
                        <h3>Texto Original Extraído</h3>
                        <pre>${originalText || 'Nenhum texto extraído'}</pre>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn" id="ocr-dismiss-btn">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modalBackdrop);
    
    // Set up event handlers
    document.getElementById('close-ocr-modal').addEventListener('click', () => {
        modalBackdrop.remove();
    });
    
    document.getElementById('ocr-dismiss-btn').addEventListener('click', () => {
        modalBackdrop.remove();
    });
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
        <div class="photo-actions">
            <button class="photo-action photo-ocr" title="Extrair texto desta imagem">
                <i class="fas fa-text-height"></i>
            </button>
            <button class="photo-remove" title="Remover foto">
                <i class="fas fa-times"></i>
            </button>
        </div>
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
    
    // Add OCR functionality for this specific photo
    const ocrBtn = photoElement.querySelector('.photo-action.photo-ocr');
    if (ocrBtn) {
        ocrBtn.addEventListener('click', async () => {
            // Find the photo data
            const photo = currentPhotos.find(p => p.id === photoId);
            if (!photo) return;
            
            // Add processing state to the photo item
            photoElement.classList.add('ocr-processing');
            
            // Show progress indicator
            updateOCRProgress(0, 'Iniciando OCR...');
            
            try {
                // Get OCR manager
                const ocrManager = getOCRManager();
                
                // Progress callback
                const updateProgress = (progress, status) => {
                    updateOCRProgress(progress, status);
                };
                
                // Extract data from the image
                const result = await ocrManager.extractFormData(photo.data, updateProgress);
                
                // Hide progress indicator and remove processing state
                hideOCRProgress();
                photoElement.classList.remove('ocr-processing');
                
                if (result.success) {
                    // Apply extracted data to the form
                    applyDataToForm(result.data, result.data.confidenceScores);
                    
                    // Show success toast
                    showToast('Sucesso', 'Texto extraído e campos preenchidos.', 'success');
                    
                    // Create a detailed results modal for review
                    showOCRResultsModal(result.data, result.originalText);
                } else {
                    showToast('Erro', `Falha na extração: ${result.error || 'Erro desconhecido'}`, 'error');
                }
            } catch (error) {
                console.error('OCR extraction error:', error);
                hideOCRProgress();
                photoElement.classList.remove('ocr-processing');
                showToast('Erro', 'Ocorreu um erro durante a extração de texto. Tente novamente.', 'error');
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
