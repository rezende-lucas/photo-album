// people.js - Operações relacionadas às pessoas catalogadas

import { getDOMElements } from './ui.js';
import { formatDate, emptyToNull, generateRegistrationId } from './utils.js';
import { renderPeople } from './render.js';
import { showToast } from '../components/toast.js';
import { state } from '../main.js';

/**
 * Abre modal de detalhes da pessoa
 */
export function openPersonDetails(id) {
    const elements = getDOMElements();
    const person = state.people.find(p => p.id === id);
    
    if (!person) return;
    
    elements.personIdElement.textContent = `REG-ID: ${generateRegistrationId(person.id)}`;
    
    elements.personDetails.innerHTML = `
        <div class="modal-img">
            <img src="${person.photo || '/api/placeholder/400/320'}" alt="${person.name}">
            <div class="modal-stamp">CATALOGADO</div>
        </div>
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
    
    // Preencher formulário com dados da pessoa
    document.getElementById('name').value = person.name || '';
    document.getElementById('filiation').value = person.filiation || '';
    document.getElementById('address').value = person.address || '';
    document.getElementById('history').value = person.history || '';
    document.getElementById('dob').value = person.dob || '';
    document.getElementById('phone').value = person.phone || '';
    document.getElementById('email').value = person.email || '';
    elements.fileName.textContent = person.photo ? 'Foto atual' : '';
    
    state.currentPersonId = id;
    elements.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

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
        email: emptyToNull(formData.get('email'))
    };
        
    const photoFile = elements.fileInput.files[0];
    
    if (photoFile) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            personData.photo = e.target.result;
            savePersonToStorage(personData);
        };
        
        reader.readAsDataURL(photoFile);
    } else {
        // Se nenhuma nova foto for selecionada no modo de edição, manter a foto existente
        if (state.currentPersonId) {
            const existingPerson = state.people.find(p => p.id === state.currentPersonId);
            if (existingPerson && existingPerson.photo) {
                personData.photo = existingPerson.photo;
            }
        }
        
        savePersonToStorage(personData);
    }
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
            state.people = state.
