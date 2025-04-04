// ui.js - Manipulação da interface do usuário

/**
 * Verifica se a aplicação está rodando no GitHub Pages
 * @returns {boolean} Verdadeiro se estiver no GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Retorna uma URL para imagem placeholder que funciona em qualquer ambiente
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @returns {string} URL da imagem placeholder
 */
function getPlaceholderImage(width = 400, height = 320) {
    return isGitHubPages()
        ? `https://via.placeholder.com/${width}x${height}`
        : `/api/placeholder/${width}/${height}`;
}

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
        searchContainer: document.querySelector('.search-container'),
        mobileSearchToggle: document.getElementById('mobile-search-toggle'),
        mainContent: document.querySelector('.main-content'),
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

    const closeButton = warningElement.querySelector('button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            warningElement.remove();
        });
    }

    document.body.appendChild(warningElement);
}

/**
 * Resolve o caminho para uma URL baseado no ambiente (GitHub Pages ou local)
 * @param {string} path - Caminho relativo
 * @returns {string} Caminho completo resolvido
 */
export function resolvePath(path) {
    // Adicionar prefixo para GitHub Pages
    return isGitHubPages() ? `/photo-album/${path}` : `./${path}`;
}

/**
 * Alterna o modo escuro/claro
 */
export function toggleDarkMode() {
    const elements = getDOMElements();

    if (!elements.body || !elements.themeToggle) {
        console.warn('Elementos necessários para alternar tema não encontrados');
        return false;
    }

    elements.body.classList.toggle('light-mode');
    const isDarkMode = elements.body.classList.contains('light-mode');

    // Atualizar ícone do botão
    elements.themeToggle.innerHTML = isDarkMode ?
        '<i class="fas fa-sun"></i>' :
        '<i class="fas fa-moon"></i>';

    // Salvar preferência
    try {
        localStorage.setItem('darkMode', isDarkMode);
    } catch (error) {
        console.warn('Não foi possível salvar preferência de tema:', error);
    }

    return isDarkMode;
}

/**
 * Alterna a visibilidade da barra lateral
 */
export function toggleSidebar() {
    const elements = getDOMElements();

    if (!elements.sidebar) {
        console.warn('Elemento sidebar não encontrado');
        return;
    }

    elements.sidebar.classList.toggle('active');

    // Garantir que os textos dos itens do menu e os títulos das seções fiquem visíveis
    // quando o sidebar estiver ativo no modo mobile
    const isMobile = window.innerWidth <= 992;
    if (isMobile && elements.sidebar.classList.contains('active')) {
        // Garantir que os textos dos itens do menu fiquem visíveis
        const menuTexts = elements.sidebar.querySelectorAll('.sidebar-btn span');
        menuTexts.forEach(span => {
            span.style.opacity = '1';
        });

        // Garantir que os títulos das seções fiquem visíveis
        const sectionTitles = elements.sidebar.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.opacity = '1';
        });
    }
}

/**
 * Alterna a visibilidade do dropdown do usuário
 */
export function toggleUserDropdown() {
    const elements = getDOMElements();

    if (!elements.userDropdown) {
        console.warn('Elemento userDropdown não encontrado');
        return;
    }

    elements.userDropdown.classList.toggle('active');
}

/**
 * Alterna a visibilidade da barra de pesquisa em dispositivos móveis
 */
export function toggleMobileSearch() {
    const elements = getDOMElements();

    if (!elements.searchContainer || !elements.mainContent) {
        console.warn('Elementos necessários para alternar barra de pesquisa não encontrados');
        return;
    }

    elements.searchContainer.classList.toggle('active');
    elements.mainContent.classList.toggle('search-active');

    // Focar no campo de pesquisa quando estiver visível
    if (elements.searchContainer.classList.contains('active') && elements.searchInput) {
        setTimeout(() => {
            elements.searchInput.focus();
        }, 300);
    }
}

/**
 * Atualiza o estado ativo dos botões na barra lateral
 */
export function updateSidebarActive(view) {
    const elements = getDOMElements();

    if (!elements.sidebarBtns || !elements.sidebarBtns.length) {
        console.warn('Botões da barra lateral não encontrados');
        return;
    }

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
        elements.userDisplayName.textContent = user.user_metadata?.name || user.email || 'Usuário';
    }

    // Tratar avatar do usuário
    if (elements.userAvatar) {
        if (user && user.user_metadata?.avatar_url) {
            // Se o usuário tem avatar, usar
            elements.userAvatar.src = user.user_metadata.avatar_url;
            elements.userAvatar.style.display = 'block';

            // Remover iniciais se existirem
            const initialsEl = elements.userAvatar.parentElement?.querySelector('.user-initials');
            if (initialsEl) {
                initialsEl.remove();
            }
        } else {
            // Sem avatar, usar placeholder ou iniciais
            const placeholderUrl = getPlaceholderImage(40, 40);

            // Verificar se já existe um elemento de iniciais
            const existingInitials = elements.userAvatar.parentElement?.querySelector('.user-initials');

            if (!existingInitials && elements.userAvatar.parentElement) {
                // Avatar não disponível, esconder imagem e mostrar iniciais
                elements.userAvatar.style.display = 'none';

                // Obter inicial do nome ou email
                const initial = (user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase();
                elements.userAvatar.parentElement.innerHTML += `<div class="user-initials">${initial}</div>`;
            } else if (!existingInitials) {
                // Se não podemos adicionar iniciais, mostrar placeholder
                elements.userAvatar.src = placeholderUrl;
                elements.userAvatar.style.display = 'block';
            }
        }
    }

    // Toggle do dropdown de usuário - só adicionar listener se não existir
    if (elements.userDropdownToggle) {
        // Verificar se já tem listener adicionado
        const hasClickListener = elements.userDropdownToggle._hasToggleListener;

        if (!hasClickListener) {
            elements.userDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleUserDropdown();
            });

            // Marcar que já adicionamos o listener
            elements.userDropdownToggle._hasToggleListener = true;
        }
    }

    // Adicionar listener global para fechar dropdown ao clicar fora (apenas uma vez)
    if (!window._hasDropdownClickListener && elements.userDropdown && elements.userDropdownToggle) {
        document.addEventListener('click', function(e) {
            if (elements.userDropdown &&
                elements.userDropdownToggle &&
                !elements.userDropdownToggle.contains(e.target) &&
                !elements.userDropdown.contains(e.target)) {
                elements.userDropdown.classList.remove('active');
            }
        });

        // Marcar que já adicionamos o listener global
        window._hasDropdownClickListener = true;
    }
}
