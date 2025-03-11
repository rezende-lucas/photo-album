// Declaração inicial de variáveis globais para garantir que existam antes do uso
let people = [];
let currentPersonId = null;
let currentView = 'grid';
let isDarkMode = false;
let supabaseClient = null;

// Função para criar um cliente Supabase fictício que utiliza localStorage
function createMockSupabaseClient() {
    return {
        from: (table) => ({
            select: () => Promise.resolve({ data: JSON.parse(localStorage.getItem(table) || '[]'), error: null }),
            insert: (data) => {
                const localData = JSON.parse(localStorage.getItem(table) || '[]');
                if (!data.id) {
                    data.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
                }
                localData.push(data);
                localStorage.setItem(table, JSON.stringify(localData));
                return Promise.resolve({ data, error: null });
            },
            update: (data) => {
                const localData = JSON.parse(localStorage.getItem(table) || '[]');
                const index = localData.findIndex(item => item.id === data.id);
                if (index !== -1) {
                    localData[index] = { ...localData[index], ...data };
                    localStorage.setItem(table, JSON.stringify(localData));
                }
                return Promise.resolve({ data, error: null });
            },
            delete: () => {
                const localData = JSON.parse(localStorage.getItem(table) || '[]');
                const filteredData = localData.filter(item => item.id !== currentPersonId);
                localStorage.setItem(table, JSON.stringify(filteredData));
                return Promise.resolve({ error: null });
            }
        })
    };
}

// Configuração inicial - executa assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se a configuração do Supabase é válida
    const configInvalid = 
        typeof SUPABASE_URL === 'undefined' || 
        typeof SUPABASE_KEY === 'undefined' || 
        SUPABASE_URL === '__SUPABASE_URL__' || 
        SUPABASE_KEY === '__SUPABASE_KEY__' ||
        SUPABASE_URL === '' ||
        SUPABASE_KEY === '';
    
    if (configInvalid) {
        console.warn('⚠️ Configuração do Supabase inválida. Usando apenas armazenamento local.');
        
        // Crie um elemento visual de aviso na página
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
            <strong>Aviso:</strong> 
            Conexão com o banco de dados não configurada. 
            Usando armazenamento local temporário.
            <button style="margin-left: 10px; padding: 2px 8px; cursor: pointer;">
                Fechar
            </button>
        `;
        
        warningElement.querySelector('button').addEventListener('click', () => {
            warningElement.remove();
        });
        
        document.body.appendChild(warningElement);
        
        // Criando um cliente fictício para evitar erros
        supabaseClient = createMockSupabaseClient();
    } else {
        try {
            // Inicialização do Supabase com verificação
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Cliente Supabase inicializado com sucesso");
        } catch (error) {
            console.error("Erro ao inicializar cliente Supabase:", error);
            // Criando um cliente fictício para evitar erros
            supabaseClient = createMockSupabaseClient();
            
            // Exibir aviso de erro
            const errorElement = document.createElement('div');
            errorElement.style.backgroundColor = '#f8d7da';
            errorElement.style.color = '#721c24';
            errorElement.style.padding = '10px';
            errorElement.style.margin = '10px';
            errorElement.style.borderRadius = '4px';
            errorElement.style.position = 'fixed';
            errorElement.style.top = '80px';
            errorElement.style.right = '10px';
            errorElement.style.zIndex = '9999';
            errorElement.innerHTML = `
                <strong>Erro:</strong> 
                Falha ao conectar com o banco de dados. 
                Usando armazenamento local temporário.
                <button style="margin-left: 10px; padding: 2px 8px; cursor: pointer;">
                    Fechar
                </button>
            `;
            
            errorElement.querySelector('button').addEventListener('click', () => {
                errorElement.remove();
            });
            
            document.body.appendChild(errorElement);
        }
    }
    
    // Recuperar preferência de tema e outros dados do localStorage
    isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Inicializar aplicação
    init().catch(err => {
        console.error('Erro ao inicializar aplicação:', err);
        // Carregar dados do localStorage como fallback
        people = JSON.parse(localStorage.getItem('albumPeople')) || [];
        renderPeople();
        setupEventListeners();
    });
});

// Função para carregar pessoas do Supabase ou localStorage
async function loadPeopleFromDB() {
    try {
        const { data, error } = await supabaseClient
            .from('people')
            .select('*');
            
        if (error) {
            console.error('Erro ao carregar dados:', error);
            // Fallback para dados locais em caso de erro
            return JSON.parse(localStorage.getItem('albumPeople')) || [];
        }
        
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('albumPeople', JSON.stringify(data));
        return data || [];
    } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        // Fallback para dados locais em caso de erro
        return JSON.parse(localStorage.getItem('albumPeople')) || [];
    }
}

// Initialize the application
async function init() {
    // Apply dark mode if saved
    if (isDarkMode) {
        document.body.classList.add('light-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Carregar dados do Supabase ou localStorage
    try {
        people = await loadPeopleFromDB();
    } catch (error) {
        console.error('Falha ao carregar dados:', error);
        // Fallback para localStorage
        people = JSON.parse(localStorage.getItem('albumPeople')) || [];
    }
    
    renderPeople();
    setupEventListeners();
}

// DOM Elements - Busca todos os elementos necessários
function getDOMElements() {
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
        toastContainer: document.getElementById('toast-container')
    };
}

// Render people based on the current view
function renderPeople(filteredPeople = null) {
    const elements = getDOMElements();
    const peopleToRender = filteredPeople || people;
    
    // Show empty state if no people
    if (peopleToRender.length === 0) {
        elements.photoGrid.style.display = 'none';
        elements.photoList.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        return;
    }
    
    // Hide empty state
    elements.emptyState.style.display = 'none';
    
    // Render based on current view
    if (currentView === 'grid') {
        renderGridView(peopleToRender);
    } else {
        renderListView(peopleToRender);
    }
}

// Utility: Generate registration ID
function generateRegistrationId(personId) {
    const idNum = personId.substring(0, 8).toUpperCase();
    return `REG-${idNum}`;
}

// Render grid view
function renderGridView(peopleArray) {
    const elements = getDOMElements();
    elements.photoGrid.style.display = 'grid';
    elements.photoList.style.display = 'none';
    
    elements.photoGrid.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        const card = document.createElement('div');
        card.className = 'person-card fade-in';
        card.dataset.id = person.id;
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Generate a random tag type for visualization (in a real system, this would be based on actual data)
        const tagTypes = ['', 'danger', 'warning', 'success'];
        const tagType = tagTypes[Math.floor(Math.random() * tagTypes.length)];
        const tagText = tagType === 'danger' ? 'ATENÇÃO' : 
                        tagType === 'warning' ? 'VERIFICAR' : 
                        tagType === 'success' ? 'LIBERADO' : '';
        
        card.innerHTML = `
            <div class="card-id">
                <div class="id-label">ID</div>
                <div class="id-number">${generateRegistrationId(person.id)}</div>
            </div>
            ${tagText ? `<div class="card-tag ${tagType}">${tagText}</div>` : ''}
            <div class="card-img">
                <img src="${person.photo || '/api/placeholder/400/320'}" alt="${person.name}">
            </div>
            <div class="card-content">
                <h3 class="person-name">
                    ${person.name}
                </h3>
                <p class="person-info">
                    <i class="fas fa-user-friends info-icon"></i> 
                    ${person.filiation || 'Sem informação de filiação'}
                </p>
                <p class="person-info">
                    <i class="fas fa-map-marker-alt info-icon"></i> 
                    ${formatAddress(person.address)}
                </p>
                <div class="card-controls">
                    <button class="card-btn edit-btn" data-id="${person.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="card-btn delete-btn" data-id="${person.id}">
                        <i class="fas fa-trash-alt"></i> Deletar
                    </button>
                </div>
            </div>
        `;
        
        elements.photoGrid.appendChild(card);
    });
    
    // Add event listeners for card buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditForm(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePerson(btn.dataset.id);
        });
    });
}

// Render list view
function renderListView(peopleArray) {
    const elements = getDOMElements();
    elements.photoGrid.style.display = 'none';
    elements.photoList.style.display = 'flex';
    
    elements.photoList.innerHTML = '';
    
    peopleArray.forEach((person, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item fade-in';
        listItem.dataset.id = person.id;
        listItem.style.animationDelay = `${index * 0.05}s`;
        
        listItem.innerHTML = `
            <div class="list-img">
                <img src="${person.photo || '/api/placeholder/400/320'}" alt="${person.name}">
            </div>
            <div class="list-content">
                <div class="list-id">${generateRegistrationId(person.id)}</div>
                <h3 class="person-name">${person.name}</h3>
                <p class="person-info">
                    <i class="fas fa-user-friends info-icon"></i> 
                    ${person.filiation || 'Sem informação de filiação'}
                </p>
                <p class="person-info">
                    <i class="fas fa-map-marker-alt info-icon"></i> 
                    ${formatAddress(person.address)}
                </p>
            </div>
            <div class="list-actions">
                <button class="list-btn" data-id="${person.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="list-btn delete-btn" data-id="${person.id}" title="Deletar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        elements.photoList.appendChild(listItem);
    });
    
    // Add event listeners for list buttons
    document.querySelectorAll('.list-btn').forEach(btn => {
        if (btn.classList.contains('delete-btn')) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePerson(btn.dataset.id);
            });
        } else {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditForm(btn.dataset.id);
            });
        }
    });
}

// Open person details modal
function openPersonDetails(id) {
    const elements = getDOMElements();
    const person = people.find(p => p.id === id);
    
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
    
    // Add event listeners for edit and delete buttons
    elements.personDetails.querySelector('.edit-btn').addEventListener('click', function() {
        const id = this.dataset.id;
        elements.closePersonModal.click();
        openEditForm(id);
    });
    
    elements.personDetails.querySelector('.delete-btn').addEventListener('click', function() {
        const id = this.dataset.id;
        deletePerson(id);
    });
}

// Open form to add new person
function openAddForm() {
    const elements = getDOMElements();
    document.getElementById('form-title').innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Novo Registro';
    elements.personForm.reset();
    elements.fileName.textContent = '';
    currentPersonId = null;
    elements.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Open form to edit existing person
function openEditForm(id) {
    const elements = getDOMElements();
    const person = people.find(p => p.id === id);
    
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
    elements.fileName.textContent = person.photo ? 'Foto atual' : '';
    
    currentPersonId = id;
    elements.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Save person data from form
function savePerson(event) {
    event.preventDefault();
    const elements = getDOMElements();
    
    const formData = new FormData(elements.personForm);
    const personData = {
        name: formData.get('name'),
        filiation: formData.get('filiation'),
        address: formData.get('address'),
        history: formData.get('history'),
        dob: formData.get('dob'),
        phone: formData.get('phone'),
        email: formData.get('email')
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
        // If no new photo is selected in edit mode, keep the existing photo
        if (currentPersonId) {
            const existingPerson = people.find(p => p.id === currentPersonId);
            if (existingPerson && existingPerson.photo) {
                personData.photo = existingPerson.photo;
            }
        }
        
        savePersonToStorage(personData);
    }
}

// Save person data to localStorage and/or Supabase
async function savePersonToStorage(personData) {
    const elements = getDOMElements();
    try {
        if (currentPersonId) {
            // Update existing person
            const { error } = await supabaseClient
                .from('people')
                .update(personData)
                .eq('id', currentPersonId);
                
            if (error) throw error;
            
            // Atualizar no array local
            const index = people.findIndex(p => p.id === currentPersonId);
            if (index !== -1) {
                personData.id = currentPersonId;
                people[index] = personData;
            }
            
            showToast('Registro Atualizado', 'Dados do indivíduo atualizados com sucesso no sistema.', 'success');
        } else {
            // Generate UUID for new person
            personData.id = generateId();
            
            // Add new person to Supabase
            const { error } = await supabaseClient
                .from('people')
                .insert(personData);
                
            if (error) throw error;
            
            // Add to local array
            people.push(personData);
            showToast('Registro Adicionado', 'Novo indivíduo catalogado com sucesso no sistema.', 'success');
        }
        
        // Update localStorage as backup
        localStorage.setItem('albumPeople', JSON.stringify(people));
        
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        renderPeople();
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        showToast('Erro', 'Falha ao salvar os dados. Tentando armazenamento local.', 'error');
        
        // Fallback para localStorage
        if (currentPersonId) {
            const index = people.findIndex(p => p.id === currentPersonId);
            if (index !== -1) {
                personData.id = currentPersonId;
                people[index] = personData;
            }
        } else {
            personData.id = generateId();
            people.push(personData);
        }
        
        localStorage.setItem('albumPeople', JSON.stringify(people));
        elements.formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        renderPeople();
    }
}

// Delete person
async function deletePerson(id) {
    const elements = getDOMElements();
    if (confirm('ATENÇÃO: Você tem certeza que deseja excluir este registro permanentemente?')) {
        try {
            // Delete from Supabase
            const { error } = await supabaseClient
                .from('people')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            // Remove from local array
            people = people.filter(p => p.id !== id);
            
            // Update localStorage as backup
            localStorage.setItem('albumPeople', JSON.stringify(people));
            
            elements.personModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            renderPeople();
            
            showToast('Registro Excluído', 'Indivíduo removido permanentemente do sistema.', 'success');
        } catch (error) {
            console.error('Erro ao excluir do Supabase:', error);
            showToast('Erro', 'Falha ao excluir os dados. Tentando exclusão local.', 'error');
            
            // Fallback para exclusão local
            people = people.filter(p => p.id !== id);
            localStorage.setItem('albumPeople', JSON.stringify(people));
            elements.personModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            renderPeople();
        }
    }
}

// Search people
function searchPeople(query) {
    if (!query.trim()) {
        renderPeople();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    const filtered = people.filter(person => {
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

// Show toast notification
function showToast(title, message, type = '') {
    const elements = getDOMElements();
    const toastId = Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" data-id="${toastId}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Make the toast visible after a small delay
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        closeToast(this.dataset.id);
    });
    
    // Auto close after 4 seconds
    setTimeout(() => {
        closeToast(toastId);
    }, 4000);
}

// Close toast notification
function closeToast(id) {
    const toast = document.querySelector(`.toast[data-id="${id}"]`);
    
    if (toast) {
        toast.classList.remove('active');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const elements = getDOMElements();
    elements.body.classList.toggle('light-mode');
    isDarkMode = elements.body.classList.contains('light-mode');
    
    // Update button icon
    elements.themeToggle.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const elements = getDOMElements();
    elements.sidebar.classList.toggle('active');
}

// Utility: Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Utility: Format address for display
function formatAddress(address) {
    if (!address) return 'ENDEREÇO NÃO INFORMADO';
    
    // Truncate long addresses
    if (address.length > 30) {
        return address.substring(0, 30) + '...';
    }
    
    return address;
}

// Utility: Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Setup event listeners
function setupEventListeners() {
    const elements = getDOMElements();
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleDarkMode);
    
    // Menu toggle for mobile
    elements.menuToggle.addEventListener('click', toggleSidebar);
    
    // View toggle buttons
    elements.gridViewBtn.addEventListener('click', () => {
        currentView = 'grid';
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
        updateSidebarActive('grid');
        renderPeople();
    });
    
    elements.listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        elements.listViewBtn.classList.add('active');
        elements.gridViewBtn.classList.remove('active');
        updateSidebarActive('list');
        renderPeople();
    });
    
    // Sidebar buttons
    elements.sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            if (view) {
                // View buttons
                currentView = view;
                updateSidebarActive(view);
                
                // Update main buttons
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
    
    // Add person buttons
    elements.addPersonBtn.addEventListener('click', openAddForm);
    elements.sidebarAddBtn.addEventListener('click', openAddForm);
    // Add person buttons (continuação)
    elements.emptyAddBtn.addEventListener('click', openAddForm);
    
    // Close modals
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
    
    // Person cards/list items click
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
    
    // Form submission
    elements.personForm.addEventListener('submit', savePerson);
    
    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            elements.fileName.textContent = file.name;
        } else {
            elements.fileName.textContent = '';
        }
    });
    
    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        searchPeople(e.target.value);
    });
    
    // Close modals when clicking outside
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
}

// Update active state in sidebar
function updateSidebarActive(view) {
    const elements = getDOMElements();
    elements.sidebarBtns.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else if (btn.dataset.view) {
            btn.classList.remove('active');
        }
    });
}
