import { getDOMElements, toggleDarkMode, toggleSidebar, updateSidebarActive, toggleUserDropdown } from './ui.js';
import { openPersonDetails, openAddForm, openEditForm, savePerson, deletePerson, searchPeople } from './people.js';
import { renderPeople } from './render.js';
import { logoutUser } from './auth.js';
import { state, setState } from '../main.js';
import { showToast } from '../components/toast.js';

/**
 * Verifica se a aplicação está rodando no GitHub Pages
 * @returns {boolean} Verdadeiro se estiver no GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Resolve caminhos de módulos para importação baseado no ambiente
 * @param {string} modulePath - Caminho do módulo
 * @returns {string} Caminho resolvido
 */
function resolveModulePath(modulePath) {
    return isGitHubPages() 
        ? `/photo-album/js/modules/${modulePath}` 
        : `./${modulePath}`;
}

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
        if (elements.personDetails && elements.personDetails.contains(e.target)) {
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
    
    // User dropdown toggle
    if (elements.userDropdownToggle) {
        elements.userDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUserDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.userDropdown && 
                elements.userDropdownToggle && 
                !elements.userDropdownToggle.contains(e.target) && 
                !elements.userDropdown.contains(e.target)) {
                elements.userDropdown.classList.remove('active');
            }
        });
    }
    
    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', async () => {
            try {
                const { error } = await logoutUser();
                
                if (error) {
                    showToast('Erro', 'Falha ao encerrar sessão.', 'error');
                    return;
                }
                
                // Corrigir redirecionamento utilizando caminho relativo
                const loginPage = isGitHubPages() ? '/photo-album/login.html' : './login.html';
                window.location.href = loginPage;
            } catch (error) {
                console.error('Erro durante logout:', error);
                showToast('Erro', 'Falha ao encerrar sessão.', 'error');
            }
        });
    }
}
