// Arquivo js/config.js com tratamento de erro
try {
    const SUPABASE_URL = '__SUPABASE_URL__';
    const SUPABASE_KEY = '__SUPABASE_KEY__';
} catch (e) {
    console.error('Erro ao carregar configurações:', e);
    // Valores de fallback vazios
    const SUPABASE_URL = '';
    const SUPABASE_KEY = '';
}
