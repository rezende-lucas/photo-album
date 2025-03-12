// Main authentication controller script

import { 
    registerUser, 
    loginUser, 
    resetPassword, 
    checkAuthState, 
    getAuthErrorMessage 
} from './modules/auth.js';
import { showToast } from './components/toast.js';

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

// Authentication flow init
async function initAuth() {
    // Verificar se já está autenticado
    const { session } = await checkAuthState();
    
    if (session) {
        // Redirecionar para a página principal se já estiver logado
        window.location.href = 'index.html';
        return;
    }
    
    // Inicializar listeners
    setupEventListeners();
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
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validação básica
        if (!email || !password) {
            showError(loginError, 'Por favor, preencha todos os campos.');
            return;
        }
        
        // Tentar login
        const { data, error } = await loginUser(email, password, rememberMe);
        
        if (error) {
            showError(loginError, getAuthErrorMessage(error));
            return;
        }
        
        // Sucesso - verificar redirecionamento salvo ou ir para index
        const redirectUrl = localStorage.getItem('auth_redirect') || 'index.html';
        localStorage.removeItem('auth_redirect');
        
        showToast('Login bem-sucedido', 'Redirecionando para o sistema...', 'success');
        
        // Pequeno delay para mostrar o toast antes de redirecionar
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    });
    
    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const acceptTerms = document.getElementById('accept-terms').checked;
        
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
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Usuário registrado mas precisa fazer login
            showToast('Registro bem-sucedido', 'Sua conta foi criada. Você pode fazer login agora.', 'success');
            
            // Ativar tab de login
            authTabs[0].click();
        }
    });
    
    // Password reset form
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('reset-email').value;
        
        if (!email) {
            showError(resetError, 'Por favor, forneça seu email.');
            return;
        }
        
        const { data, error } = await resetPassword(email);
        
        if (error) {
            showError(resetError, getAuthErrorMessage(error));
            return;
        }
        
        // Esconder formulário e mostrar mensagem
        document.getElementById('reset-email').style.display = 'none';
        resetForm.querySelector('button[type="submit"]').style.display = 'none';
        resetMessage.textContent = `Email enviado para ${email}. Verifique sua caixa de entrada para redefinir sua senha.`;
        resetMessage.style.backgroundColor = 'rgba(56, 161, 105, 0.1)';
        resetMessage.style.borderColor = 'rgba(56, 161, 105, 0.3)';
        resetMessage.style.color = 'var(--success)';
    });
    
    // Forgot password link
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        clearErrors();
        
        // Esconder outros formulários
        authForms.forEach(form => form.classList.remove('active'));
        resetForm.classList.add('active');
        
        // Resetar estado do formulário de reset
        document.getElementById('reset-email').style.display = 'block';
        resetForm.querySelector('button[type="submit"]').style.display = 'flex';
        resetMessage.textContent = 'Insira seu email para receber um link de recuperação de senha.';
        resetMessage.style.backgroundColor = '';
        resetMessage.style.borderColor = '';
        resetMessage.style.color = '';
    });
    
    // Back to login button
    backToLogin.addEventListener('click', () => {
        clearErrors();
        
        // Mostrar formulário de login
        authForms.forEach(form => form.classList.remove('active'));
        loginForm.classList.add('active');
        
        // Ativar tab de login
        authTabs[0].classList.add('active');
        authTabs[1].classList.remove('active');
    });
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.add('active');
}

// Clear all error messages
function clearErrors() {
    loginError.textContent = '';
    loginError.classList.remove('active');
    registerError.textContent = '';
    registerError.classList.remove('active');
    resetError.textContent = '';
    resetError.classList.remove('active');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);
