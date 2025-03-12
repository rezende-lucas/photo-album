// Reset password handler script

import { updatePassword, getAuthErrorMessage } from './modules/auth.js';
import { showToast } from './components/toast.js';

// DOM Elements
const newPasswordForm = document.getElementById('new-password-form');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordError = document.getElementById('password-error');
const resetMessage = document.getElementById('reset-message');
const backToLogin = document.getElementById('back-to-login');

// Init function
function initResetPassword() {
    setupEventListeners();
}

// Event listeners
function setupEventListeners() {
    // Form submission
    newPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate passwords
        if (!newPassword || !confirmPassword) {
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showError('As senhas não correspondem.');
            return;
        }
        
        if (newPassword.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        // Update password
        const { data, error } = await updatePassword(newPassword);
        
        if (error) {
            showError(getAuthErrorMessage(error));
            return;
        }
        
        // Success
        showToast('Senha alterada', 'Sua senha foi atualizada com sucesso.', 'success');
        
        // Hide form inputs and buttons
        newPasswordInput.style.display = 'none';
        confirmPasswordInput.style.display = 'none';
        document.querySelectorAll('label').forEach(label => label.style.display = 'none');
        newPasswordForm.querySelector('button[type="submit"]').style.display = 'none';
        
        // Update message
        resetMessage.textContent = 'Senha atualizada com sucesso! Você pode fazer login com sua nova senha.';
        resetMessage.style.backgroundColor = 'rgba(56, 161, 105, 0.1)';
        resetMessage.style.borderColor = 'rgba(56, 161, 105, 0.3)';
        resetMessage.style.color = 'var(--success)';
    });
    
    // Back to login button
    backToLogin.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

// Show error message
function showError(message) {
    passwordError.textContent = message;
    passwordError.classList.add('active');
}

// Clear error message
function clearError() {
    passwordError.textContent = '';
    passwordError.classList.remove('active');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initResetPassword);
