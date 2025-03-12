// ui.js - Manipulação da interface do usuário

/**
 * Obtém todos os elementos do DOM usados na aplicação
 */
export function getDOMElements() {
    return {
        body: document.body,
        sidebar: document.getElementById('sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        themeToggle: document.getElementById('theme-toggle'),
        photoGrid: document.getElementById('photo-grid'),
        photoList: document.getElementById('photo-list'),
        emptyState: document.getElementById('empty-state'),
        searchInput: document.getElementById('search-input'),
        gridViewBtn: document.getElementById('grid-view-btn'),
        listViewBtn: document.getElementById('list-view-btn'),
        sidebarBtns: document.querySelectorAll('.sidebar-btn'),
        addPersonBtn: document.getElementById('add-person-btn'),
        sidebarAddBtn: document.getElementById('sidebar-add-btn'),
        emptyAddBtn: document.getElementById('empty-add-btn'),
        personModal: document.getElementById('person-modal'),
        closePersonModal: document.getElementById('close-person-modal'),
        personDetails: document.getElementById('person-details'),
        personIdElement: document.getElementById('person-id'),
        formModal: document.getElementById('form-modal'),
        closeFormModal: document.getElementById('close-form-modal'),
        personForm: document.getElementById('person-form'),
        cancelForm: document.getElementById('cancel-form'),
        fileInput: document.getElementById('photo'),
        fileName: document.getElementById('file-name'),
        toastContainer: document.getElementById('toast-container'),
        
        // Novos elementos para autenticação
        userDisplayName: document.getElementById('user-display-name'),
        userAvatar: document.getElementById('user-avatar'),
        logoutBtn: document.getElementById('logout-btn'),
        userDropdown: document.getElementById('user-dropdown'),
        userDropdownToggle: document.getElementById('user-dropdown-toggle')
    };
}

/**
 * Exibe um aviso visual na interface
 */
export function displayWarning(title, message) {
    const warningElement = document.createElement('div');
    warningElement.style.backgroundColor = '#f8d7da';
    warningElement.style.color = '#721c24';
    warningElement.style.padding = '10px';
    warningElement.style.margin = '10px';
    warningElement.style.borderRadius = '4px';
    warningElement.style.position = 'fixed';
    warningElement.style.top = '80px';
    warningElement.style.right = '10px';
    warningElement.style.zIndex = '9999';
    warningElement.innerHTML = `
        <strong>${title}:</strong> 
        ${message}
        <button style="margin-left: 10px; padding: 2px 8px; cursor: pointer;">
            Fechar
        </button>
    `;
    
    warningElement.querySelector('button').addEventListener('click', () => {
        warningElement.remove();
    });
    
    document.body.appendChild(warningElement);
}

/**
 * Alterna o modo escuro/claro
 */
export function toggleDarkMode() {
    const elements = getDOMElements();
    elements.body.classList.toggle('light-mode');
    const isDarkMode = elements.body.classList.contains('light-mode');
    
    // Atualizar ícone do botão
    elements.themeToggle.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    
    // Salvar preferência
    localStorage.setItem('darkMode', isDarkMode);
    
    return isDarkMode;
}

/**
 * Alterna a visibilidade da barra lateral
 */
export function toggleSidebar() {
    const elements = getDOMElements();
    elements.sidebar.classList.toggle('active');
}

/**
 * Alterna a visibilidade do dropdown do usuário
 */
export function toggleUserDropdown() {
    const elements = getDOMElements();
    if (elements.userDropdown) {
        elements.userDropdown.classList.toggle('active');
    }
}

/**
 * Atualiza o estado ativo dos botões na barra lateral
 */
export function updateSidebarActive(view) {
    const elements = getDOMElements();
    elements.sidebarBtns.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else if (btn.dataset.view) {
            btn.classList.remove('active');
        }
    });
}

/**
 * Inicializa elementos de interface do usuário relacionados a autenticação
 */
export function initializeUserUI(user) {
    const elements = getDOMElements();
    
    // Atualizar nome de exibição do usuário
    if (elements.userDisplayName && user) {
        elements.userDisplayName.textContent = user.user_metadata?.name || user.email;
    }
    
    // Se houver um avatar de usuário, atualizar
    if (elements.userAvatar && user && user.user_metadata?.avatar_url) {
        elements.userAvatar.src = user.user_metadata.avatar_url;
    } else if (elements.userAvatar) {
        // Avatar padrão com inicial do nome
        const initials = (user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase();
        elements.userAvatar.style.display = 'none';
        if (elements.userAvatar.parentElement) {
            elements.userAvatar.parentElement.innerHTML += `<div class="user-initials">${initials}</div>`;
        }
    }
    
    // Toggle do dropdown de usuário
    if (elements.userDropdownToggle) {
        elements.userDropdownToggle.addEventListener('click', toggleUserDropdown);
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(e) {
            if (elements.userDropdown && 
                elements.userDropdownToggle && 
                !elements.userDropdownToggle.contains(e.target) &&
                !elements.userDropdown.contains(e.target)) {
                elements.userDropdown.classList.remove('active');
            }
        });
    }
}
