
function createPersonDetailsTemplate(person) {
    return `
    <div class="modal-body">
        <h2>${person.name}</h2>
        
        <div class="row">
            <div class="col-md-6">
                <h4>Filiação</h4>
                <p><strong>Pais:</strong> ${person.filiation || 'Não informado'}</p>
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
        (person.filiation && person.filiation.toLowerCase().includes(searchTerm))
    );
}

export { createPersonDetailsTemplate, openPersonDetails, searchPeople };
