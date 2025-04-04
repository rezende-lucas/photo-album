// Arquivo js/config.js com tratamento de erro e configuração de usuário mock

// Declaração global das variáveis para acesso em todo o código
let SUPABASE_URL;
let SUPABASE_KEY;
let MOCK_USER;

try {
    // Configuração do Supabase
    SUPABASE_URL = '__SUPABASE_URL__';
    SUPABASE_KEY = '__SUPABASE_KEY__';

    // Configuração de usuário mock para ambiente local
    MOCK_USER = {
        email: 'usuario@exemplo.com',
        password: 'senha123',
        userData: {
            name: 'Usuário de Teste',
            role: 'admin'
        }
    };

    console.log('Configurações carregadas com sucesso');
} catch (e) {
    console.error('Erro ao carregar configurações:', e);

    // Valores de fallback vazios
    SUPABASE_URL = '';
    SUPABASE_KEY = '';

    // Configuração de usuário mock para ambiente local
    MOCK_USER = {
        email: 'usuario@exemplo.com',
        password: 'senha123',
        userData: {
            name: 'Usuário de Teste',
            role: 'admin'
        }
    };
}
