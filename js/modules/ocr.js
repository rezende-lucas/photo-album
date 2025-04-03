// ocr.js - Optical Character Recognition functionality
// This module handles all OCR-related operations

import { showToast } from '../components/toast.js';

/**
 * OCR Manager - Provides functionality for text extraction from images
 */
class OCRManager {
    constructor() {
        this.tesseract = null;
        this.isInitialized = false;
        this.isProcessing = false;
        this.progressCallback = null;
    }

    /**
     * Initialize the Tesseract.js library
     * @returns {Promise} Resolves when initialization is complete
     */
    async initialize() {
        if (this.isInitialized) return Promise.resolve();

        try {
            // Dynamic import of Tesseract.js
            const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
            
            // Create and initialize the worker
            this.tesseract = createWorker({
                // Portuguese language for Brazilian documents
                logger: m => this.updateProgress(m),
            });

            await this.tesseract.load();
            await this.tesseract.loadLanguage('por');
            await this.tesseract.initialize('por');
            
            this.isInitialized = true;
            console.log('OCR engine initialized successfully');
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to initialize OCR engine:', error);
            this.isInitialized = false;
            return Promise.reject(error);
        }
    }

    /**
     * Update the progress of OCR processing
     * @param {Object} progressInfo - Information about the current progress
     */
    updateProgress(progressInfo) {
        if (this.progressCallback && progressInfo.status) {
            let progress = 0;
            
            // Calculate progress percentage based on status
            switch (progressInfo.status) {
                case 'loading tesseract core':
                    progress = 10;
                    break;
                case 'initializing tesseract':
                    progress = 20;
                    break;
                case 'loading language traineddata':
                    progress = 30;
                    break;
                case 'initializing api':
                    progress = 40;
                    break;
                case 'recognizing text':
                    progress = 50 + (progressInfo.progress * 50);
                    break;
                default:
                    progress = 0;
            }
            
            this.progressCallback(Math.round(progress), progressInfo.status);
        }
    }

    /**
     * Set a callback function to track OCR progress
     * @param {Function} callback - Function to call with progress updates
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    /**
     * Preprocess the image to improve OCR accuracy
     * @param {string} imageData - Base64 encoded image data
     * @returns {Promise<string>} Processed image data
     */
    async preprocessImage(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions to match the image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw the original image
                ctx.drawImage(img, 0, 0);
                
                // Get image data for processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Simple image processing:
                // 1. Convert to grayscale
                // 2. Increase contrast
                for (let i = 0; i < data.length; i += 4) {
                    // Convert to grayscale
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    
                    // Apply contrast enhancement
                    const contrast = 1.5; // Contrast factor
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    let newVal = factor * (avg - 128) + 128;
                    
                    // Ensure values are within range
                    newVal = Math.max(0, Math.min(255, newVal));
                    
                    // Apply the new value to all channels
                    data[i] = data[i + 1] = data[i + 2] = newVal;
                }
                
                // Put the processed data back on the canvas
                ctx.putImageData(imageData, 0, 0);
                
                // Return the processed image as base64
                resolve(canvas.toDataURL('image/jpeg'));
            };
            
            img.src = imageData;
        });
    }

    /**
     * Extract text from an image
     * @param {string} imageData - Base64 encoded image data
     * @returns {Promise<string>} Extracted text
     */
    async extractText(imageData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (this.isProcessing) {
            throw new Error('OCR is already processing an image');
        }
        
        try {
            this.isProcessing = true;
            
            // Preprocess the image to improve OCR accuracy
            const processedImage = await this.preprocessImage(imageData);
            
            // Recognize text
            const result = await this.tesseract.recognize(processedImage);
            
            this.isProcessing = false;
            return result.data.text;
        } catch (error) {
            this.isProcessing = false;
            console.error('Error during OCR processing:', error);
            throw error;
        }
    }
    
    /**
     * Parse extracted text and map to form fields
     * @param {string} text - Extracted text from OCR
     * @returns {Object} Mapped fields
     */
    parseExtractedText(text) {
        if (!text) return {};
        
        // Convert text to lowercase and normalize whitespace
        const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
        
        // Initialize result object with all potential form fields
        const result = {
            name: null,
            mother: null,
            father: null,
            CPF: null,
            RG: null,
            address: null,
            dob: null,
            phone: null,
            email: null,
            history: null,
            confidenceScores: {} // Track confidence for each field
        };
        
        // Extract CPF using regex pattern
        const cpfRegex = /(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2})/g;
        const cpfMatches = normalizedText.match(cpfRegex);
        if (cpfMatches && cpfMatches.length > 0) {
            result.CPF = cpfMatches[0].replace(/[^\d]/g, '');
            result.confidenceScores.CPF = 'high';
        }
        
        // Extract RG using regex pattern (multiple formats)
        const rgRegex = /(\d{2}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?[\dxX])|(\d{1,2}[.\s]?\d{3}[.\s]?\d{3})/g;
        const rgMatches = normalizedText.match(rgRegex);
        if (rgMatches && rgMatches.length > 0) {
            // Filter out anything that might be a CPF
            const possibleRg = rgMatches.find(match => !match.match(/\d{3}[.\s]?\d{3}[.\s]?\d{3}/));
            if (possibleRg) {
                result.RG = possibleRg.replace(/[^\d]/g, '');
                result.confidenceScores.RG = 'high';
            }
        }
        
        // Extract name (often preceded by "nome:")
        const nameRegex = /nome:?\s*([^\n]+)/i;
        const nameMatch = text.match(nameRegex);
        if (nameMatch && nameMatch[1]) {
            result.name = nameMatch[1].trim();
            result.confidenceScores.name = 'medium';
        }
        
        // Extract mother's name
        const motherRegex = /m[ãa]e:?\s*([^\n]+)/i;
        const motherMatch = text.match(motherRegex);
        if (motherMatch && motherMatch[1]) {
            result.mother = motherMatch[1].trim();
            result.confidenceScores.mother = 'medium';
        }
        
        // Extract father's name
        const fatherRegex = /pai:?\s*([^\n]+)/i;
        const fatherMatch = text.match(fatherRegex);
        if (fatherMatch && fatherMatch[1]) {
            result.father = fatherMatch[1].trim();
            result.confidenceScores.father = 'medium';
        }
        
        // Extract address (often preceded by "endereço:", "endereco:" or "residência:")
        const addressRegex = /(endere[çc]o|resid[êe]ncia|rua|av|avenida):?\s*([^\n]+)/i;
        const addressMatch = text.match(addressRegex);
        if (addressMatch && addressMatch[2]) {
            result.address = addressMatch[2].trim();
            result.confidenceScores.address = 'medium';
        }
        
        // Extract date of birth
        const dobRegex = /(data\s+de\s+nascimento|nascimento|dt\s+nasc)[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})/i;
        const dobMatch = text.match(dobRegex);
        if (dobMatch && dobMatch[2]) {
            // Convert to yyyy-mm-dd format for the date input
            const dateParts = dobMatch[2].split(/[\/\-\.]/);
            if (dateParts.length === 3) {
                let year = dateParts[2];
                const month = dateParts[1];
                const day = dateParts[0];
                
                // Fix two-digit years
                if (year.length === 2) {
                    const currentYear = new Date().getFullYear();
                    const century = Math.floor(currentYear / 100) * 100;
                    year = parseInt(year) + century;
                    // If year is in the future, use previous century
                    if (year > currentYear) {
                        year -= 100;
                    }
                }
                
                result.dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                result.confidenceScores.dob = 'medium';
            }
        }
        
        // Extract phone number
        const phoneRegex = /(?:telefone|tel|fone|celular)[:\s]*(\(?\d{2}\)?[\s\-\.]?\d{4,5}[\s\-\.]?\d{4})/i;
        const phoneMatch = text.match(phoneRegex);
        if (phoneMatch && phoneMatch[1]) {
            result.phone = phoneMatch[1].replace(/[^\d]/g, '');
            result.confidenceScores.phone = 'medium';
        }
        
        // Extract email
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
        const emailMatch = text.match(emailRegex);
        if (emailMatch && emailMatch[1]) {
            result.email = emailMatch[1].toLowerCase();
            result.confidenceScores.email = 'high';
        }
        
        return result;
    }
    
    /**
     * Extract text from image and return mapped form fields
     * @param {string} imageData - Base64 encoded image data
     * @param {Function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Object>} Extracted data mapped to form fields
     */
    async extractFormData(imageData, progressCallback) {
        if (progressCallback) {
            this.setProgressCallback(progressCallback);
        }
        
        try {
            // Extract text from the image
            const extractedText = await this.extractText(imageData);
            
            // Parse and map the extracted text to form fields
            const mappedData = this.parseExtractedText(extractedText);
            
            return {
                success: true,
                data: mappedData,
                originalText: extractedText
            };
        } catch (error) {
            console.error('Error extracting form data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Terminate the OCR worker when done
     */
    async terminate() {
        if (this.tesseract && this.isInitialized) {
            try {
                await this.tesseract.terminate();
                this.isInitialized = false;
                console.log('OCR engine terminated');
            } catch (error) {
                console.error('Error terminating OCR engine:', error);
            }
        }
    }
}

// Create a singleton instance
let ocrManager = null;

/**
 * Get the OCR manager instance
 * @returns {OCRManager} The OCR manager instance
 */
export function getOCRManager() {
    if (!ocrManager) {
        ocrManager = new OCRManager();
    }
    return ocrManager;
}

/**
 * Apply extracted data to form fields
 * @param {Object} data - Extracted and mapped data
 * @param {Object} confidenceScores - Confidence scores for each field
 */
export function applyDataToForm(data, confidenceScores = {}) {
    if (!data) return;
    
    // Get form elements
    const form = document.getElementById('person-form');
    if (!form) return;
    
    // Map of field IDs to their corresponding data properties
    const fieldMap = {
        'name': 'name',
        'mother': 'mother',
        'father': 'father',
        'CPF': 'CPF',
        'RG': 'RG',
        'address': 'address',
        'dob': 'dob',
        'phone': 'phone',
        'email': 'email',
        'history': 'history'
    };
    
    // Apply data to each field
    Object.entries(fieldMap).forEach(([fieldId, dataKey]) => {
        const field = document.getElementById(fieldId);
        if (field && data[dataKey]) {
            field.value = data[dataKey];
            
            // Apply visual indication based on confidence
            const confidence = confidenceScores[dataKey] || 'low';
            
            // Remove any existing confidence classes
            field.classList.remove('high-confidence', 'medium-confidence', 'low-confidence');
            
            // Add appropriate confidence class
            field.classList.add(`${confidence}-confidence`);
        }
    });
    
    // Show a toast notification
    showToast('OCR Concluído', 'Dados extraídos da imagem e aplicados ao formulário. Por favor verifique e corrija se necessário.', 'info');
}
