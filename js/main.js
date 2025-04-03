
// Import migration function
import { migratePeopleData } from './modules/people.js';

// Update main initialization
async function initializeApp() {
    try {
        // Fetch existing data
        const { data, error } = await supabase
            .from('people')
            .select('*');

        if (error) throw error;

        // Migrate data to new structure
        state.people = migratePeopleData(data);

        // Re-render or update UI as needed
        renderPeopleList();
        
    } catch (err) {
        console.error('Migration Error:', err);
    }
}

// Call initialization on app load
document.addEventListener('DOMContentLoaded', initializeApp);
