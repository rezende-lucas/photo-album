// people.js - Operações relacionadas às pessoas catalogadas

import { getDOMElements } from './ui.js';
import { formatDate, emptyToNull, generateRegistrationId } from './utils.js';
import { renderPeople } from './render.js';
import { showToast } from '../components/toast.js';
import { state } from '../main.js';
import { setExistingPhotos, getCurrentPhotos } from './photoManager.js';

/**
 * Determina se o ambiente é GitHub Pages ou local
 * @returns {boolean} Verdadeiro se for GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Retorna uma URL de placeholder segura para qualquer ambiente
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem 
 * @returns {string} URL da imagem placeholder
 */
function getPlaceholderImage(width = 400, height = 320) {
    // Use a API local para placeholders quando não estiver no GitHub Pages
    // e use um serviço confiável quando estiver em produção
    return isGitHubPages() 
        ? `https://placehold.co/${width}x${height}` 
        : `/api/placeholder/${width}/${height}`;
}

/**
 * Resolve o caminho para importações dinâmicas
 * @param {string} modulePath - Caminho do módulo a ser importado
 * @returns {string} Caminho correto para o módulo
 */
function resolveModulePath(modulePath) {
    if (isGitHubPages()) {
        return `/photo-album/js/modules/${modulePath}`;
    }
    return `./${modulePath}`;
}

/**
 * Abre modal de detalhes da pessoa
 */
export function openPersonDetails(id) {
    const elements = getDOMElements();
    const person = state.people.find(p => p.id === id);
    
    if (!person) return;
    
    elements.personIdElement.textContent = `REG-ID: ${generateRegistrationId(person.id)}`;
    
    // Create photo gallery HTML based on available photos
    // Aqui gerenciamos fotos apenas localmente para exibição
    const localPhotos = person.localPhotos || [];
    
    const photoGalleryHTML = localPhotos.length > 0
        ? `<div class="modal-photos-gallery">
            ${localPhotos.map(photo => `
                <div class="modal-photo-item">
                    <img src="${photo.data}" alt="${person.name}">
                </div>
            `).join('')}
          </div>`
        : `<div class="modal-img">
            <img src="${person.photo || getPlaceholderImage(400, 320)}" alt="${person.name}">
            <div class="modal-stamp">CATALOGADO</div>
          </div>`;
    
    // Utiliza os novos campos mother e father, com fallback para filiation
    const motherInfo = person.mother || (person.filiation ? person.filiation.split(' e ')[0] : '');
    const fatherInfo = person.father || (person.filiation && person.filiation.includes(' e ') ? person.filiation.split(' e ')[1] : '');
    
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
                
                <!-- CPF e RG -->
                ${person.CPF ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-id-card"></i> CPF
                    </div>
                    <div class="detail-text">${person.CPF}</div>
                </div>
                ` : ''}
                
                ${person.RG ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-id-badge"></i> RG
                    </div>
                    <div class="detail-text">${person.RG}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-row">
                <!-- Mãe e Pai em vez de Filiação -->
                ${motherInfo ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-female"></i> Mãe
                    </div>
                    <div class="detail-text">${motherInfo}</div>
                </div>
                ` : ''}
                
                ${fatherInfo ? `
                <div class="detail-group">
                    <div class="detail-label">
                        <i class="fas fa-male"></i> Pai
                    </div>
                    <div class="detail-text">${fatherInfo}</div>
                </div>
                ` : ''}
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
    // Verificar se o elemento existe antes de tentar acessar suas propriedades
    const formTitle = document.getElementById('form-title');
    
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Novo Registro';
    }
    
    // Verificar se o formulário existe
    if (elements.personForm) {
        elements.personForm.reset();
    }
    
    // Verificar se o elemento filename existe
    const filenameElement = document.getElementById('file-name');
    if (filenameElement) {
        filenameElement.textContent = '';
    }
    
    state.currentPersonId = null;
    
    // Verificar se a função existe antes de chamá-la
    if (typeof setExistingPhotos === 'function') {
        try {
            setExistingPhotos([]);
        } catch (error) {
            console.warn('Não foi possível resetar a galeria de fotos:', error);
        }
    }
    
    // Verificar se o modal existe
    if (elements.formModal) {
        elements.formModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal de formulário não encontrado');
    }
}

/**
 * Abre formulário para editar pessoa existente
 */
export function openEditForm(id) {
    const elements = getDOMElements();
    const person = state.people.find(p => p.id === id);
    
    if (!person) return;
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Registro';
    }
    
    // Fill form with person data
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = person.name || '';
    
    // Lidar com os novos campos (mãe, pai, CPF e RG)
    // Para compatibilidade com dados antigos, usamos filiation se necessário
    
    const motherInput = document.getElementById('mother');
    if (motherInput) {
        // Se tiver mother, usa. Senão, tenta extrair da filiation
        motherInput.value = person.mother || 
            (person.filiation ? person.filiation.split(' e ')[0].trim() : '');
    }
    
    const fatherInput = document.getElementById('father');
    if (fatherInput) {
        // Se tiver father, usa. Senão, tenta extrair da filiation
        fatherInput.value = person.father || 
            (person.filiation && person.filiation.includes(' e ') ? 
             person.filiation.split(' e ')[1].trim() : '');
    }
    
    const cpfInput = document.getElementById('CPF');
    if (cpfInput) cpfInput.value = person.CPF || '';
    
    const rgInput = document.getElementById('RG');
    if (rgInput) rgInput.value = person.RG || '';
    
    const addressInput = document.getElementById('address');
    if (addressInput) addressInput.value = person.address || '';
    
    const historyInput = document.getElementById('history');
    if (historyInput) historyInput.value = person.history || '';
    
    const dobInput = document.getElementById('dob');
    if (dobInput) dobInput.value = person.dob || '';
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = person.phone || '';
    
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = person.email || '';
    
    // Set up photo gallery with existing photos (apenas localmente)
    if (typeof setExistingPhotos === 'function') {
        if (person.localPhotos && person.localPhotos.length > 0) {
            setExistingPhotos(person.localPhotos);
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
    }
    
    state.currentPersonId = id;
    
    if (elements.formModal) {
        elements.formModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
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
    
    // Usar o caminho correto para importação dinâmica baseado no ambiente
    const cameraModulePath = resolveModulePath('camera.js');
    
    // Importação dinâmica do módulo de câmera com caminho corrigido
    import(cameraModulePath)
        .then(({ getCameraManager }) => {
            cameraBtn.addEventListener('click', () => {
                const cameraManager = getCameraManager();
                
                // Abrir câmera com callback para processar a foto
                cameraManager.openCamera((imageData) => {
                    // Atualizar visualização do formulário
                    const fileNameElement = document.getElementById('file-name');
                    if (fileNameElement) {
                        fileNameElement.textContent = 'Foto capturada com a câmera';
                    }
                    
                    // Usar o state para armazenar a imagem em vez de window
                    if (typeof state.setState === 'function') {
                        state.setState({ capturedImage: imageData });
                    } else {
                        // Fallback para window apenas se necessário
                        window.capturedImage = imageData;
                    }
                    
                    console.log('Foto capturada com sucesso');
                });
            });
            
            console.log('Botão de câmera configurado com sucesso');
        })
        .catch(error => {
            console.error('Erro ao carregar módulo de câmera:', error);
            cameraBtn.style.display = 'none';
        });
}

/**
 * Salvar dados da pessoa do formulário
 */
export function savePerson(event) {
    event.preventDefault();
    const elements = getDOMElements();
    
    if (!elements.personForm) {
        console.error('Formulário não encontrado');
        return;
    }
    
    const formData = new FormData(elements.personForm);
    
    // Atualizado para incluir os novos campos
    const personData = {
        name: formData.get('name'),
        mother: emptyToNull(formData.get('mother')),
        father: emptyToNull(formData.get('father')),
        CPF: emptyToNull(formData.get('CPF')),
        RG: emptyToNull(formData.get('RG')),
        address: emptyToNull(formData.get('address')),
        history: emptyToNull(formData.get('history')),
        dob: emptyToNull(formData.get('dob')),
        phone: emptyToNull(formData.get('phone')),
        email: emptyToNull(formData.get('email')),
        photo: null // Inicializa com valor nulo
    };
    
    // Para compatibilidade, também preenche o campo filiation com base nos campos mother e father
    if (personData.mother || personData.father) {
        if (personData.mother && personData.father) {
            personData.filiation = `${personData.mother} e ${personData.father}`;
        } else if (personData.mother) {
            personData.filiation = personData.mother;
        } else if (personData.father) {
            personData.filiation = personData.father;
        }
    }
    
    // Obter as fotos atuais
    const currentPhotos = typeof getCurrentPhotos === 'function' ? getCurrentPhotos() : [];
    
    // Para compatibilidade com o Supabase, definir a primeira foto como a foto principal
    if (currentPhotos && currentPhotos.length > 0) {
        personData.photo = currentPhotos[0].data;
    }
    
    // Armazenar fotos localmente (sem enviar ao Supabase)
    personData.localPhotos = currentPhotos;
    
    savePersonToStorage(personData);
}

/**
 * Salvar dados da pessoa no armazenamento
 */
async function savePersonToStorage(personData) {
    const elements = getDOMElements();
    
    // Criar uma cópia do objeto para enviar ao Supabase, incluindo os novos campos
    const supabaseData = {
        name: personData.name,
        mother: personData.mother,
        father: personData.father,
        CPF: personData.CPF,
        RG: personData.RG,
        filiation: personData.filiation,  // Para compatibilidade
        address: personData.address,
        history: personData.history,
        dob: personData.dob,
        phone: personData.phone,
        email: personData.email,
        photo: personData.photo
    };
    
    try {
        if (state.currentPersonId) {
            // Atualizar pessoa existente
            const { error } = await state.supabaseClient
                .from('people')
                .update(supabaseData)
                .eq('id', state.currentPersonId);
                
            if (error) throw error;
            
            // Atualizar no array local - incluindo fotos
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
                .insert(supabaseData)
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
        
        if (elements.formModal) {
            elements.formModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
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
        
        if (elements.formModal) {
            elements.formModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
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
            
            if (elements.personModal) {
                elements.personModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            renderPeople();
            
            showToast('Registro Excluído', 'Indivíduo removido permanentemente do sistema.', 'success');
        } catch (error) {
            console.error('Erro ao excluir do Supabase:', error);
            showToast('Erro', 'Falha ao excluir os dados. Tentando exclusão local.', 'error');
            
            // Fallback para exclusão local
            state.people = state.people.filter(p => p.id !== id);
            localStorage.setItem('albumPeople', JSON.stringify(state.people));
            
            if (elements.personModal) {
                elements.personModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
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
            // Adiciona pesquisa nos novos campos
            (person.mother && person.mother.toLowerCase().includes(lowerQuery)) ||
            (person.father && person.father.toLowerCase().includes(lowerQuery)) ||
            (person.CPF && person.CPF.toLowerCase().includes(lowerQuery)) ||
            (person.RG && person.RG.toLowerCase().includes(lowerQuery)) ||
            // Mantém a pesquisa no campo filiation para compatibilidade
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
