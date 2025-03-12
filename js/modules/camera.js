// camera.js - Funcionalidade de câmera para captura de fotos

/**
 * Gerencia a funcionalidade de câmera para captura de fotos
 */
export class CameraManager {
    constructor() {
        // Elementos do DOM
        this.cameraModal = document.getElementById('camera-modal');
        this.closeCameraModal = document.getElementById('close-camera-modal');
        this.cameraFeed = document.getElementById('camera-feed');
        this.cameraCanvas = document.getElementById('camera-canvas');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.usePhotoBtn = document.getElementById('use-photo-btn');
        this.switchCameraBtn = document.getElementById('switch-camera-btn');
        
        // Estado da câmera
        this.stream = null;
        this.facingMode = 'user'; // 'user' para câmera frontal, 'environment' para traseira
        this.photoTaken = false;
        this.onPhotoCapture = null;
        
        // Inicializar eventos
        this.setupEventListeners();
    }
    
    /**
     * Configura os event listeners para os controles da câmera
     */
    setupEventListeners() {
        // Fechar modal
        this.closeCameraModal.addEventListener('click', () => {
            this.closeCamera();
        });
        
        // Clicar fora do modal para fechar
        this.cameraModal.addEventListener('click', (e) => {
            if (e.target === this.cameraModal) {
                this.closeCamera();
            }
        });
        
        // Capturar foto
        this.captureBtn.addEventListener('click', () => {
            this.capturePhoto();
        });
        
        // Nova foto
        this.retakeBtn.addEventListener('click', () => {
            this.retakePhoto();
        });
        
        // Usar foto capturada
        this.usePhotoBtn.addEventListener('click', () => {
            this.usePhoto();
        });
        
        // Alternar câmera (frontal/traseira)
        this.switchCameraBtn.addEventListener('click', () => {
            this.toggleCamera();
        });
    }
    
    /**
     * Abre a câmera e exibe o modal
     * @param {Function} callback - Função a ser chamada quando a foto for selecionada
     */
    async openCamera(callback) {
        this.onPhotoCapture = callback;
        this.photoTaken = false;
        
        // Atualizar UI
        this.captureBtn.style.display = 'flex';
        this.retakeBtn.style.display = 'none';
        this.usePhotoBtn.style.display = 'none';
        
        // Iniciar câmera
        try {
            await this.startCamera();
            
            // Mostrar modal
            this.cameraModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            alert('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
        }
    }
    
    /**
     * Inicia o stream de vídeo da câmera
     */
    async startCamera() {
        // Parar qualquer stream anterior
        if (this.stream) {
            this.stopCamera();
        }
        
        // Configurações da câmera
        const constraints = {
            video: {
                facingMode: this.facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        // Solicitar acesso à câmera
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.cameraFeed.srcObject = this.stream;
    }
    
    /**
     * Para o stream de vídeo e libera recursos
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
    
    /**
     * Fecha o modal da câmera
     */
    closeCamera() {
        this.stopCamera();
        this.cameraModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    /**
     * Captura uma foto do stream de vídeo
     */
    capturePhoto() {
        if (!this.stream) return;
        
        const context = this.cameraCanvas.getContext('2d');
        const { videoWidth, videoHeight } = this.cameraFeed;
        
        // Configurar canvas para as dimensões do vídeo
        this.cameraCanvas.width = videoWidth;
        this.cameraCanvas.height = videoHeight;
        
        // Desenhar o frame atual do vídeo no canvas
        context.drawImage(this.cameraFeed, 0, 0, videoWidth, videoHeight);
        
        // Atualizar UI
        this.photoTaken = true;
        this.captureBtn.style.display = 'none';
        this.retakeBtn.style.display = 'flex';
        this.usePhotoBtn.style.display = 'flex';
        
        // Pausar vídeo e mostrar imagem capturada
        this.cameraFeed.pause();
    }
    
    /**
     * Descartar a foto capturada e voltar a mostrar o feed da câmera
     */
    retakePhoto() {
        if (!this.stream) return;
        
        // Limpar canvas
        const context = this.cameraCanvas.getContext('2d');
        context.clearRect(0, 0, this.cameraCanvas.width, this.cameraCanvas.height);
        
        // Atualizar UI
        this.photoTaken = false;
        this.captureBtn.style.display = 'flex';
        this.retakeBtn.style.display = 'none';
        this.usePhotoBtn.style.display = 'none';
        
        // Reiniciar vídeo
        this.cameraFeed.play();
    }
    
    /**
     * Usa a foto capturada e fecha o modal
     */
    usePhoto() {
        if (!this.photoTaken || !this.onPhotoCapture) return;
        
        // Converter imagem do canvas para base64
        const imageData = this.cameraCanvas.toDataURL('image/jpeg');
        
        // Chamar callback com a imagem
        this.onPhotoCapture(imageData);
        
        // Fechar modal
        this.closeCamera();
    }
    
    /**
     * Alterna entre câmera frontal e traseira
     */
    async toggleCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        
        try {
            await this.startCamera();
        } catch (error) {
            console.error('Erro ao alternar câmera:', error);
            // Tentar reverter para a configuração anterior
            this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
            await this.startCamera();
        }
    }
}

// Instância do gerenciador de câmera
let cameraManager = null;

/**
 * Obtém a instância do gerenciador de câmera, criando uma se necessário
 */
export function getCameraManager() {
    if (!cameraManager) {
        cameraManager = new CameraManager();
    }
    return cameraManager;
}
