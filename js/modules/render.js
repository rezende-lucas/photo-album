
function createPersonDetailsTemplate(person) {
    return `
    <div class="modal-body">
        <h2>${person.name}</h2>
        
        <div class="row">
            <div class="col-md-6">
                <h4>Informações dos Pais</h4>
                <p><strong>Mãe:</strong> ${person.mother || 'Não informado'}</p>
                ${person.motherCPF ? `<p><strong>CPF da Mãe:</strong> ${person.motherCPF}</p>` : ''}
                ${person.motherRG ? `<p><strong>RG da Mãe:</strong> ${person.motherRG}</p>` : ''}
                
                <p><strong>Pai:</strong> ${person.father || 'Não informado'}</p>
                ${person.fatherCPF ? `<p><strong>CPF do Pai:</strong> ${person.fatherCPF}</p>` : ''}
                ${person.fatherRG ? `<p><strong>RG do Pai:</strong> ${person.fatherRG}</p>` : ''}
            </div>
            <!-- Other person details -->
        </div>
    </div>
    `;
}

function openPersonDetails(person) {
    const detailsModal = document.getElementById('personDetailsModal');
    const modalContent = detailsModal.querySelector('.modal-content');
    
    modalContent.innerHTML = createPersonDetailsTemplate(person);
    
    // Show modal
    const modal = new bootstrap.Modal(detailsModal);
    modal.show();
}

// Search and filter functions
function searchPeople(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    return state.people.filter(person => 
        person.name.toLowerCase().includes(searchTerm) ||
        (person.mother && person.mother.toLowerCase().includes(searchTerm)) ||
        (person.father && person.father.toLowerCase().includes(searchTerm)) ||
        (person.motherCPF && person.motherCPF.includes(searchTerm)) ||
        (person.fatherCPF && person.fatherCPF.includes(searchTerm))
    );
}

export { createPersonDetailsTemplate, openPersonDetails, searchPeople };
