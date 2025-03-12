// people.js - Operações relacionadas às pessoas catalogadas

import { getDOMElements } from './ui.js';
import { formatDate, emptyToNull, generateRegistrationId } from './utils.js';
import { renderPeople } from './render.js';
import { showToast } from '../components/toast.js';
import { state } from '../main.js';
import { getCameraManager } from './camera.js';
import { setExistingPhotos, getCurrentPhotos } from './photoManager.js';

/**
 * Abre modal de detalhes da pessoa
 */
export function openPersonDetails(id) {
    const elements = getDOMElements();
    const person = state.people.find(p => p.id === id);
    
    if (!person) return;
    
    elements.personIdElement.textContent = `REG-ID: ${generateRegistrationId(person.id)}`;
    
    // Create photo gallery HTML based on available photos
    const photoGalleryHTML = person.photos && person.photos.length > 0
        ? `<div class="modal-photos-gallery">
            ${person.photos.map(photo => `
                <div class="modal-photo-item">
                    <img src="${photo.data}" alt="${person.name}">
                </div>
            `).join('')}
          </div>`
        : `<div class="modal-img">
            <img src="${person.photo || '/api/placeholder/400/320'}" alt="${person.name}">
            <div class="modal-stamp">CATALOGADO</div>
          </div>`;
    
    elements.personDetails.innerHTML = `
        ${photoGalleryHTML}
        <div class="modal-details">
            <div class="detail-row">
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-user"></i> Nome Completo
                    </div>
                    <div class="detail-text">${person.name}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-user-friends"></i> Filiação
                    </div>
                    <div class="detail-text">${person.filiation || 'Não informado'}</div>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-map-marker-alt"></i> Endereço
                    </div>
                    <div class="detail-text">${person.address || 'Não informado'}</div>
                </div>
                ${person.dob ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-calendar-alt"></i> Data de Nascimento
                    </div>
                    <div class="detail-text">${formatDate(person.dob)}</div>
                </div>
                ` : ''}
            </div>
            <div class="detail-row">
                ${person.phone ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-phone"></i> Telefone
                    </div>
                    <div class="detail-text">${person.phone}</div>
                </div>
                ` : ''}
                ${person.email ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-envelope"></i> Email
                    </div>
                    <div class="detail-text">${person.email}</div>
                </div>
                ` : ''}
            </div>
            <div class="detail-row">
                <div class="detail-group detail-history">
                    <div class="detail-label">
                        <i class="fas fa-history"></i> Histórico/Observações
                    </div>
                    <div class="detail-text">${person.history || 'Sem histórico registrado'}</div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn delete-btn" data-id="${person.id}">
                    <i class="fas fa-trash-alt"></i> Excluir Registro
                </button>
                <button class="modal-btn edit-btn" data-id="${person.id}">
                    <i class="fas fa-edit"></i> Editar Registro
                </button>
            </div>
        </div>
    `;
    
    elements.personModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Abre formulário para adicionar nova pessoa
 */
export function openAddForm() {
    const elements = getDOMElements();
    document.getElementById('form-title').innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Novo Registro';
    elements.personForm.reset();
    elements.fileName.textContent = '';
    state.currentPersonId = null;
    
    // Reset the photo gallery
    setExistingPhotos([]);
    
    elements.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Abre formulário para editar pessoa existente
 */
export function openEditForm(id) {
    const elements = getDOMElements();
    const person = state.people.find(p => p.id === id);
    
    if (!person) return;
    
    document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Registro';
    
    // Fill form with person data
    document.getElementById('name').value = person.name || '';
    document.getElementById('filiation').value = person.filiation || '';
    document.getElementById('address').value = person.address || '';
    document.getElementById('history').value = person.history || '';
    document.getElementById('dob').value = person.dob || '';
    document.getElementById('phone').value = person.phone || '';
    document.getElementById('email').value = person.email || '';
    
    // Set up photo gallery with existing photos
    if (person.photos && person.photos.length > 0) {
        setExistingPhotos(person.photos);
    } else if (person.photo) {
        // Handle legacy data with single photo
        setExistingPhotos([{
            id: 'legacy',
            data: person.photo,
            dateAdded: new Date().toISOString()
        }]);
    } else {
        setExistingPhotos([]);
    }
    
    state.currentPersonId = id;
    elements.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Configura o botão de câmera para captura de fotos
 */
export function setupCameraButton() {
    const cameraBtn = document.getElementById('camera-btn');
    
    if (!cameraBtn) {
        console.error('Botão de câmera não encontrado');
        return;
    }
    
    // Verificar se a API de câmera está disponível
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('API de câmera não disponível neste navegador');
        cameraBtn.style.display = 'none';
        return;
    }
    
    // Importação dinâmica do módulo de câmera para garantir que ele seja carregado corretamente
    import(window.location.hostname === 'rezende-lucas.github.io' 
    ? '/photo-album/js/modules/camera.js' 
    : './camera.js').then(({ getCameraManager }) => {
        cameraBtn.addEventListener('click', () => {
            const cameraManager = getCameraManager();
            
            // Abrir câmera com callback para processar a foto
            cameraManager.openCamera((imageData) => {
                // Atualizar visualização do formulário
                const fileNameElement = document.getElementById('file-name');
                if (fileNameElement) {
                    fileNameElement.textContent = 'Foto capturada com a câmera';
                }
                
                // Armazenar dados da imagem para uso posterior
                window.capturedImage = imageData;
                
                // Log para debug
                console.log('Foto capturada com sucesso');
            });
        });
        
        console.log('Botão de câmera configurado com sucesso');
    }).catch(error => {
        console.error('Erro ao carregar módulo de câmera:', error);
        cameraBtn.style.display = 'none';
    });
}

/**
 * Salvar dados da pessoa do formulário
 */
/**
 * Salvar dados da pessoa do formulário
 */
export function savePerson(event) {
    event.preventDefault();
    const elements = getDOMElements();
    
    const formData = new FormData(elements.personForm);
    
    const personData = {
        name: formData.get('name'),
        filiation: emptyToNull(formData.get('filiation')),
        address: emptyToNull(formData.get('address')),
        history: emptyToNull(formData.get('history')),
        dob: emptyToNull(formData.get('dob')),
        phone: emptyToNull(formData.get('phone')),
        email: emptyToNull(formData.get('email')),
        // Use the new photos array
        photos: getCurrentPhotos()
    };
    
    // For backward compatibility, set the first photo as the main photo
    if (personData.photos && personData.photos.length > 0) {
        personData.photo = personData.photos[0].data;
    }
    
    savePersonToStorage(personData);
}

/**
 * Salvar dados da pessoa no armazenamento
 */
async function savePersonToStorage(personData) {
    const elements = getDOMElements();
    try {
        if (state.currentPersonId) {
            // Atualizar pessoa existente
            const { error } = await state.supabaseClient
                .from('people')
                .update(personData)
                .eq('id', state.currentPersonId);
                
            if (error) throw error;
            
            // Atualizar no array local
            const index = state.people.findIndex(p => p.id === state.currentPersonId);
            if (index !== -1) {
                personData.id = state.currentPersonId;
                state.people[index] = personData;
            }
            
            showToast('Registro Atualizado', 'Dados do indivíduo atualizados com sucesso no sistema.', 'success');
        } else {
            // Adicionar nova pessoa ao Supabase
            const { data, error } = await state.supabaseClient
                .from('people')
                .insert(personData)
                .select();
                
            if (error) throw error;
            
            // Adicionar ao array local
            if (data && data[0]) {
                personData.id = data[0].id;
                state.people.push(personData);
                showToast('Registro Adicionado', 'Novo indivíduo catalogado com sucesso no sistema.', 'success');
            }
        }
        
        // Atualizar localStorage como backup
        localStorage.setItem('albumPeople', JSON.stringify(state.people));
        
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        renderPeople();
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        showToast('Erro', 'Falha ao salvar os dados. Tentando armazenamento local.', 'error');
        
        // Fallback para localStorage
        if (state.currentPersonId) {
            const index = state.people.findIndex(p => p.id === state.currentPersonId);
            if (index !== -1) {
                personData.id = state.currentPersonId;
                state.people[index] = personData;
            }
        } else {
            personData.id = generateId();
            state.people.push(personData);
        }
        
        localStorage.setItem('albumPeople', JSON.stringify(state.people));
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        renderPeople();
    }
}

/**
 * Excluir pessoa
 */
export async function deletePerson(id) {
    const elements = getDOMElements();
    if (confirm('ATENÇÃO: Você tem certeza que deseja excluir este registro permanentemente?')) {
        try {
            // Excluir do Supabase
            const { error } = await state.supabaseClient
                .from('people')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            // Remover do array local
            state.people = state.people.filter(p => p.id !== id);
            
            // Atualizar localStorage como backup
            localStorage.setItem('albumPeople', JSON.stringify(state.people));
            
            elements.personModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            renderPeople();
            
            showToast('Registro Excluído', 'Indivíduo removido permanentemente do sistema.', 'success');
        } catch (error) {
            console.error('Erro ao excluir do Supabase:', error);
            showToast('Erro', 'Falha ao excluir os dados. Tentando exclusão local.', 'error');
            
            // Fallback para exclusão local
            state.people = state.people.filter(p => p.id !== id);
            localStorage.setItem('albumPeople', JSON.stringify(state.people));
            elements.personModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            renderPeople();
        }
    }
}

/**
 * Pesquisar pessoas
 */
export function searchPeople(query) {
    if (!query.trim()) {
        renderPeople();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = state.people.filter(person => {
        const regId = generateRegistrationId(person.id).toLowerCase();
        return (
            person.name.toLowerCase().includes(lowerQuery) ||
            (person.filiation && person.filiation.toLowerCase().includes(lowerQuery)) ||
            (person.address && person.address.toLowerCase().includes(lowerQuery)) ||
            (person.history && person.history.toLowerCase().includes(lowerQuery)) ||
            (person.email && person.email.toLowerCase().includes(lowerQuery)) ||
            regId.includes(lowerQuery)
        );
    });
    
    renderPeople(filtered);
}

// Função auxiliar para gerar ID (caso Supabase falhe)
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
