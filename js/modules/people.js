
// Updated savePerson function to handle new fields
function savePerson(event) {
    event.preventDefault();
    
    const personData = {
        id: document.getElementById('id').value,
        name: document.getElementById('name').value,
        // ... other existing fields
        
        // New fields for mother
        mother: document.getElementById('mother').value,
        motherCPF: document.getElementById('mother-cpf').value,
        motherRG: document.getElementById('mother-rg').value,
        
        // New fields for father
        father: document.getElementById('father').value,
        fatherCPF: document.getElementById('father-cpf').value,
        fatherRG: document.getElementById('father-rg').value,
    };

    // Prepare data for Supabase
    const supabaseData = {
        name: personData.name,
        // ... other existing fields
        
        // Migration-friendly approach
        filiation: `${personData.mother} e ${personData.father}`,
        
        // New individual fields
        mother: personData.mother,
        motherCPF: personData.motherCPF,
        motherRG: personData.motherRG,
        father: personData.father,
        fatherCPF: personData.fatherCPF,
        fatherRG: personData.fatherRG,
    };

    // Rest of the existing save logic...
}

// Update migration logic in loadPeople or initialization
function migratePeopleData(people) {
    return people.map(person => {
        // If already migrated, return as-is
        if (person.mother && person.father && 
            (person.motherCPF || person.fatherCPF) && 
            (person.motherRG || person.fatherRG)) {
            return person;
        }
        
        // Migration from old filiation field
        if (person.filiation) {
            const parts = person.filiation.split(/\s+e\s+|\s+E\s+|,\s*|\s+[eE]\s+/);
            
            person.mother = parts[0]?.trim() || '';
            person.father = parts[1]?.trim() || '';
        }
        
        // Initialize new fields if not present
        person.motherCPF = person.motherCPF || '';
        person.motherRG = person.motherRG || '';
        person.fatherCPF = person.fatherCPF || '';
        person.fatherRG = person.fatherRG || '';
        
        return person;
    });
}

// Export updated functions
export { savePerson, migratePeopleData };
