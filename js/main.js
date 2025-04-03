
// Existing initialization and import logic
async function initializeApp() {
    try {
        const { data, error } = await supabase
            .from('people')
            .select('*');

        if (error) throw error;

        state.people = data;
        renderPeopleList();
        
    } catch (err) {
        console.error('Initialization Error:', err);
    }
}

// Call initialization on app load
document.addEventListener('DOMContentLoaded', initializeApp);
