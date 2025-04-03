
function savePerson(event) {
    event.preventDefault();
    
    const personData = {
        id: document.getElementById('id').value,
        name: document.getElementById('name').value,
        filiation: document.getElementById('filiation').value
    };

    const supabaseData = {
        name: personData.name,
        filiation: personData.filiation
    };

    // Existing save logic...
}

export { savePerson };
