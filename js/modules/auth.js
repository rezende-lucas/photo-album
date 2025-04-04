// auth.js - Módulo de autenticação

import { showToast } from '../components/toast.js';
import { checkSupabaseConfig, isLocalEnvironment, MOCK_USER } from './config.js';

/**
 * Verifica se deve usar autenticação mock
 */
function shouldUseMockAuth() {
    return !checkSupabaseConfig() || isLocalEnvironment();
}

/**
 * Cria um cliente de autenticação mock
 */
function createMockAuthClient() {
    console.log('🔑 Usando autenticação mock para ambiente local');

    // Verifica se o usuário mock já está na sessão
    const mockSession = JSON.parse(localStorage.getItem('mock_auth_session') || 'null');

    return {
        auth: {
            signUp: ({ email, password, options }) => {
                // Simula registro de usuário
                if (email === MOCK_USER.email) {
                    return Promise.resolve({
                        error: { message: 'Usuário já existe', code: 'user_already_exists' }
                    });
                }

                const user = {
                    id: Date.now().toString(),
                    email,
                    user_metadata: options?.data || {}
                };

                return Promise.resolve({ data: { user } });
            },
            signInWithPassword: ({ email, password }) => {
                // Verifica se as credenciais correspondem ao usuário mock
                if (email === MOCK_USER.email && password === MOCK_USER.password) {
                    const session = {
                        user: {
                            id: 'mock-user-id',
                            email: MOCK_USER.email,
                            user_metadata: MOCK_USER.userData
                        },
                        access_token: 'mock-token-' + Date.now(),
                        expires_at: Date.now() + 3600000 // Expira em 1 hora
                    };

                    // Salva a sessão mock no localStorage
                    localStorage.setItem('mock_auth_session', JSON.stringify(session));

                    return Promise.resolve({ data: { session } });
                } else {
                    return Promise.resolve({
                        error: { message: 'Email ou senha incorretos', code: 'invalid_grant' }
                    });
                }
            },
            signOut: () => {
                localStorage.removeItem('mock_auth_session');
                return Promise.resolve({ error: null });
            },
            getSession: () => {
                const session = JSON.parse(localStorage.getItem('mock_auth_session') || 'null');
                return Promise.resolve({ data: { session }, error: null });
            },
            getUser: () => {
                const session = JSON.parse(localStorage.getItem('mock_auth_session') || 'null');
                return Promise.resolve({
                    data: { user: session?.user || null },
                    error: null
                });
            },
            updateUser: (updates) => {
                const session = JSON.parse(localStorage.getItem('mock_auth_session') || 'null');

                if (!session) {
                    return Promise.resolve({
                        error: { message: 'Usuário não autenticado' }
                    });
                }

                if (updates.password) {
                    // Atualização de senha simulada
                    console.log('Senha atualizada com sucesso (simulação)');
                }

                if (updates.data) {
                    // Atualiza os metadados do usuário
                    session.user.user_metadata = {
                        ...session.user.user_metadata,
                        ...updates.data
                    };

                    localStorage.setItem('mock_auth_session', JSON.stringify(session));
                }

                return Promise.resolve({ data: { user: session.user }, error: null });
            },
            resetPasswordForEmail: (email) => {
                // Simula envio de email de recuperação
                console.log(`Email de recuperação enviado para ${email} (simulação)`);
                return Promise.resolve({ data: {}, error: null });
            }
        }
    };
}

/**
 * Inicializa cliente Supabase para autenticação
 */
export function initializeAuthClient() {
    // Verifica se deve usar autenticação mock
    if (shouldUseMockAuth()) {
        return createMockAuthClient();
    }

    // Caso contrário, usa o cliente Supabase real
    if (!checkSupabaseConfig()) {
        console.error('Configuração do Supabase ausente ou inválida');
        return null;
    }

    try {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (error) {
        console.error('Erro ao inicializar cliente de autenticação:', error);
        return null;
    }
}

/**
 * Registra um novo usuário
 */
export async function registerUser(email, password, userData = {}) {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        // Registrar usuário - sem especificar redirectTo para confirmação
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData  // Removido emailRedirectTo para não depender de confirmação
            }
        });

        if (error) throw error;

        return { data };
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return { error };
    }
}

/**
 * Autentica um usuário existente
 */
export async function loginUser(email, password, rememberMe = false) {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Se "lembrar-me" estiver ativado, persistir sessão
        if (rememberMe) {
            localStorage.setItem('sb-remember-me', 'true');
        } else {
            localStorage.removeItem('sb-remember-me');
        }

        return { data };
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        return { error };
    }
}

/**
 * Encerra a sessão do usuário atual
 */
export async function logoutUser() {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        // Limpar dados locais da sessão
        localStorage.removeItem('sb-remember-me');

        return { success: true };
    } catch (error) {
        console.error('Erro ao encerrar sessão:', error);
        return { error };
    }
}

/**
 * Envia link de recuperação de senha
 */
export async function resetPassword(email) {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login.html` // Garante que use a origem correta
        });

        if (error) throw error;

        return { data };
    } catch (error) {
        console.error('Erro ao enviar link de recuperação:', error);
        return { error };
    }
}

/**
 * Atualiza senha do usuário
 */
export async function updatePassword(newPassword) {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { data };
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        return { error };
    }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function checkAuthState() {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return { session: null };
    }

    try {
        // Verificar sessão atual
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        return { session: data.session };
    } catch (error) {
        console.error('Erro ao verificar estado de autenticação:', error);
        return { session: null };
    }
}

/**
 * Verifica se o usuário tem permissão para acessar
 * Essa função pode ser expandida para verificar roles específicas
 */
export async function checkUserPermission(requiredRole = null) {
    const { session } = await checkAuthState();

    // Se não há sessão, o usuário não está autenticado
    if (!session) {
        return false;
    }

    // Se não há um papel específico exigido, apenas autenticação é suficiente
    if (!requiredRole) {
        return true;
    }

    // Verifica se o usuário tem o papel específico
    // Isso assume que a informação de papel está nos user.user_metadata.role
    const userRole = session.user?.user_metadata?.role;

    return userRole === requiredRole;
}

/**
 * Redireciona para página de login se não estiver autenticado
 */
export async function requireAuth() {
    const { session } = await checkAuthState();

    if (!session) {
        // Salvar URL atual para redirecionamento após login
        localStorage.setItem('auth_redirect', window.location.href);
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

/**
 * Obtém dados do usuário atual
 */
export async function getCurrentUser() {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return { user: null };
    }

    try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        return { user: data.user };
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return { user: null };
    }
}

/**
 * Atualiza dados do usuário
 */
export async function updateUserData(userData) {
    const supabase = initializeAuthClient();

    if (!supabase) {
        return {
            error: { message: 'Cliente de autenticação não inicializado' }
        };
    }

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: userData
        });

        if (error) throw error;

        return { data };
    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        return { error };
    }
}

/**
 * Mapeia erros de autenticação para mensagens amigáveis
 */
export function getAuthErrorMessage(error) {
    if (!error) return 'Ocorreu um erro desconhecido';

    // Código de erro do Supabase
    const errorCode = error.code;
    const errorMessage = error.message;

    // Mapeamento de mensagens de erro comuns
    const errorMessages = {
        'auth/invalid-email': 'Email inválido.',
        'auth/user-disabled': 'Esta conta foi desativada.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'Este email já está sendo usado.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/popup-closed-by-user': 'Operação cancelada.',
        'auth/unauthorized': 'Acesso não autorizado.',
        'unauthorized': 'Credenciais inválidas.',
        'invalid_grant': 'Email ou senha incorretos.',
        'user_already_exists': 'Usuário já existe.'
    };

    return errorMessages[errorCode] || errorMessage || 'Ocorreu um erro desconhecido';
}
