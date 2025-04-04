// Main authentication controller script

import {
    registerUser,
    loginUser,
    resetPassword,
    checkAuthState,
    getAuthErrorMessage
} from './modules/auth.js';
import { showToast } from './components/toast.js';

/**
 * Checks if the application is running on GitHub Pages
 * @returns {boolean} True if the app is running on GitHub Pages
 */
function isGitHubPages() {
    return window.location.hostname === 'rezende-lucas.github.io';
}

/**
 * Resolves a path based on the current environment
 * @param {string} path - The relative path to resolve
 * @returns {string} The resolved path
 */
function resolvePath(path) {
    if (isGitHubPages()) {
        // Add the subdirectory prefix for GitHub Pages
        return `/photo-album/${path}`;
    }
    return `./${path}`;
}

// DOM Elements
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form');
const forgotPassword = document.getElementById('forgot-password');
const backToLogin = document.getElementById('back-to-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const resetError = document.getElementById('reset-error');
const resetMessage = document.getElementById('reset-message');

/**
 * Verifica se está em ambiente local
 */
function isLocalEnvironment() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Exibe as credenciais mock para ambiente local
 */
function showMockCredentials() {
    const mockCredentialsElement = document.getElementById('mock-credentials');
    const mockEmailElement = document.getElementById('mock-email');
    const mockPasswordElement = document.getElementById('mock-password');

    if (mockCredentialsElement && mockEmailElement && mockPasswordElement && typeof MOCK_USER !== 'undefined') {
        mockEmailElement.textContent = MOCK_USER.email;
        mockPasswordElement.textContent = MOCK_USER.password;
        mockCredentialsElement.style.display = 'block';

        // Preencher automaticamente os campos de login com as credenciais mock
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (emailInput && passwordInput) {
            emailInput.value = MOCK_USER.email;
            passwordInput.value = MOCK_USER.password;
        }
    }
}

// Authentication flow init
async function initAuth() {
    try {
        // Verificar se já está autenticado
        const { session } = await checkAuthState();

        if (session) {
            // Redirecionar para a página principal se já estiver logado
            window.location.href = resolvePath('index.html');
            return;
        }

        // Verificar se está em ambiente local para mostrar credenciais mock
        if (isLocalEnvironment()) {
            showMockCredentials();
        }

        // Inicializar listeners
        setupEventListeners();
    } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        showToast('Erro', 'Falha ao inicializar sistema de autenticação.', 'error');
    }
}

// Event listeners setup
function setupEventListeners() {
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Ativar tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Mostrar formulário correspondente
            authForms.forEach(form => form.classList.remove('active'));

            if (tabName === 'login') {
                loginForm.classList.add('active');
            } else if (tabName === 'register') {
                registerForm.classList.add('active');
            }

            // Limpar mensagens de erro
            clearErrors();
        });
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;

            // Validação básica
            if (!email || !password) {
                showError(loginError, 'Por favor, preencha todos os campos.');
                return;
            }

            // Tentar login
            try {
                const { data, error } = await loginUser(email, password, rememberMe);

                if (error) {
                    showError(loginError, getAuthErrorMessage(error));
                    return;
                }

                // Sucesso - verificar redirecionamento salvo ou ir para index
                const redirectUrl = localStorage.getItem('auth_redirect') || resolvePath('index.html');
                localStorage.removeItem('auth_redirect');

                showToast('Login bem-sucedido', 'Redirecionando para o sistema...', 'success');

                // Pequeno delay para mostrar o toast antes de redirecionar
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } catch (error) {
                console.error('Erro no processo de login:', error);
                showError(loginError, 'Ocorreu um erro durante o login. Tente novamente.');
            }
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            const name = document.getElementById('register-name')?.value;
            const email = document.getElementById('register-email')?.value;
            const password = document.getElementById('register-password')?.value;
            const confirmPassword = document.getElementById('register-confirm-password')?.value;
            const acceptTerms = document.getElementById('accept-terms')?.checked || false;

            // Validação básica
            if (!name || !email || !password || !confirmPassword) {
                showError(registerError, 'Por favor, preencha todos os campos.');
                return;
            }

            if (password !== confirmPassword) {
                showError(registerError, 'As senhas não correspondem.');
                return;
            }

            if (password.length < 6) {
                showError(registerError, 'A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            if (!acceptTerms) {
                showError(registerError, 'Você deve aceitar os termos de uso.');
                return;
            }

            // Tentar registrar
            try {
                const { data, error } = await registerUser(email, password, { name });

                if (error) {
                    showError(registerError, getAuthErrorMessage(error));
                    return;
                }

                // MUDANÇA IMPORTANTE: Verificar se o usuário foi autenticado automaticamente
                if (data && data.session) {
                    // Usuário já está autenticado, redirecionar para a página principal
                    showToast('Registro bem-sucedido', 'Redirecionando para o sistema...', 'success');

                    // Pequeno delay para mostrar o toast antes de redirecionar
                    setTimeout(() => {
                        window.location.href = resolvePath('index.html');
                    }, 1000);
                } else {
                    // Usuário registrado mas precisa fazer login
                    showToast('Registro bem-sucedido', 'Sua conta foi criada. Você pode fazer login agora.', 'success');

                    // Ativar tab de login
                    if (authTabs && authTabs.length > 0) {
                        authTabs[0].click();
                    }
                }
            } catch (error) {
                console.error('Erro no processo de registro:', error);
                showError(registerError, 'Ocorreu um erro durante o registro. Tente novamente.');
            }
        });
    }

    // Password reset form
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            const resetEmailElement = document.getElementById('reset-email');
            const email = resetEmailElement?.value;

            if (!email) {
                showError(resetError, 'Por favor, forneça seu email.');
                return;
            }

            try {
                // Passar URL completa para redirecionamento considerando o ambiente
                const redirectTo = `${window.location.origin}${isGitHubPages() ? '/photo-album' : ''}/login.html`;
                const { data, error } = await resetPassword(email, redirectTo);

                if (error) {
                    showError(resetError, getAuthErrorMessage(error));
                    return;
                }

                // Esconder formulário e mostrar mensagem
                if (resetEmailElement) resetEmailElement.style.display = 'none';

                const submitButton = resetForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.style.display = 'none';

                if (resetMessage) {
                    resetMessage.textContent = `Email enviado para ${email}. Verifique sua caixa de entrada para redefinir sua senha.`;
                    resetMessage.style.backgroundColor = 'rgba(56, 161, 105, 0.1)';
                    resetMessage.style.borderColor = 'rgba(56, 161, 105, 0.3)';
                    resetMessage.style.color = 'var(--success)';
                }
            } catch (error) {
                console.error('Erro no processo de recuperação de senha:', error);
                showError(resetError, 'Ocorreu um erro ao enviar o email de recuperação.');
            }
        });
    }

    // Forgot password link
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            clearErrors();

            // Esconder outros formulários
            authForms.forEach(form => form.classList.remove('active'));
            if (resetForm) resetForm.classList.add('active');

            // Resetar estado do formulário de reset
            const resetEmailElement = document.getElementById('reset-email');
            if (resetEmailElement) resetEmailElement.style.display = 'block';

            const submitButton = resetForm?.querySelector('button[type="submit"]');
            if (submitButton) submitButton.style.display = 'flex';

            if (resetMessage) {
                resetMessage.textContent = 'Insira seu email para receber um link de recuperação de senha.';
                resetMessage.style.backgroundColor = '';
                resetMessage.style.borderColor = '';
                resetMessage.style.color = '';
            }
        });
    }

    // Back to login button
    if (backToLogin) {
        backToLogin.addEventListener('click', () => {
            clearErrors();

            // Mostrar formulário de login
            authForms.forEach(form => form.classList.remove('active'));
            if (loginForm) loginForm.classList.add('active');

            // Ativar tab de login
            if (authTabs && authTabs.length > 1) {
                authTabs[0].classList.add('active');
                authTabs[1].classList.remove('active');
            }
        });
    }
}

// Show error message
function showError(element, message) {
    if (!element) return;

    element.textContent = message;
    element.classList.add('active');
}

// Clear all error messages
function clearErrors() {
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('active');
    }

    if (registerError) {
        registerError.textContent = '';
        registerError.classList.remove('active');
    }

    if (resetError) {
        resetError.textContent = '';
        resetError.classList.remove('active');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);
