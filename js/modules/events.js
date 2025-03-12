import { getDOMElements, toggleDarkMode, toggleSidebar, updateSidebarActive } from './ui.js';
import { openPersonDetails, openAddForm, openEditForm, savePerson, deletePerson, searchPeople } from './people.js';
import { renderPeople } from './render.js';
import { state, setState } from '../main.js';

/**
 * Configura todos os event listeners da aplicação
 */
export function setupEventListeners() {
    const elements = getDOMElements();
    
    // Toggle de tema
    elements.themeToggle.addEventListener('click', () => {
        setState({ isDarkMode: toggleDarkMode() });
    });
    
    // Toggle de menu para mobile
    elements.menuToggle.addEventListener('click', toggleSidebar);
    
    // Botões de alternância de visualização
    elements.gridViewBtn.addEventListener('click', () => {
        setState({ currentView: 'grid' });
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
        updateSidebarActive('grid');
        renderPeople();
    });
    
    elements.listViewBtn.addEventListener('click', () => {
        setState({ currentView: 'list' });
        elements.listViewBtn.classList.add('active');
        elements.gridViewBtn.classList.remove('active');
        updateSidebarActive('list');
        renderPeople();
    });
    
    // Botões da barra lateral
    elements.sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            if (view) {
                // Botões de visualização
                setState({ currentView: view });
                updateSidebarActive(view);
                
                // Atualizar botões principais
                if (view === 'grid') {
                    elements.gridViewBtn.classList.add('active');
                    elements.listViewBtn.classList.remove('active');
                } else {
                    elements.listViewBtn.classList.add('active');
                    elements.gridViewBtn.classList.remove('active');
                }
                
                renderPeople();
            }
        });
    });
    
    // Botões para adicionar pessoa
    elements.addPersonBtn.addEventListener('click', openAddForm);
    elements.sidebarAddBtn.addEventListener('click', openAddForm);
    elements.emptyAddBtn.addEventListener('click', openAddForm);
    
    // Fechar modais
    elements.closePersonModal.addEventListener('click', () => {
        elements.personModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    elements.closeFormModal.addEventListener('click', () => {
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    elements.cancelForm.addEventListener('click', () => {
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Cliques em cards/itens de lista
    elements.photoGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.person-card');
        if (card && !e.target.closest('.card-btn')) {
            openPersonDetails(card.dataset.id);
        }
    });
    
    elements.photoList.addEventListener('click', (e) => {
        const listItem = e.target.closest('.list-item');
        if (listItem && !e.target.closest('.list-btn')) {
            openPersonDetails(listItem.dataset.id);
        }
    });
    
    // Event delegation para botões de edição e exclusão
    document.addEventListener('click', (e) => {
        // Botões de edição
        if (e.target.closest('.edit-btn')) {
            const button = e.target.closest('.edit-btn');
            openEditForm(button.dataset.id);
        }
        
        // Botões de exclusão
        if (e.target.closest('.delete-btn')) {
            const button = e.target.closest('.delete-btn');
            deletePerson(button.dataset.id);
        }
    });
    
    // Envio do formulário
    elements.personForm.addEventListener('submit', savePerson);
    
    // Alteração do input de arquivo
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            elements.fileName.textContent = file.name;
        } else {
            elements.fileName.textContent = '';
        }
    });
    
    // Input de pesquisa
    elements.searchInput.addEventListener('input', (e) => {
        searchPeople(e.target.value);
    });
    
    // Fechar modais ao clicar fora
    elements.personModal.addEventListener('click', (e) => {
        if (e.target === elements.personModal) {
            elements.personModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    elements.formModal.addEventListener('click', (e) => {
        if (e.target === elements.formModal) {
            elements.formModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Event listeners para detalhes da pessoa
    document.addEventListener('click', (e) => {
        if (elements.personDetails.contains(e.target)) {
            const editBtn = e.target.closest('.modal-btn.edit-btn');
            const deleteBtn = e.target.closest('.modal-btn.delete-btn');
            
            if (editBtn) {
                const id = editBtn.dataset.id;
                elements.closePersonModal.click();
                openEditForm(id);
            } else if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                deletePerson(id);
            }
        }
    });
}
