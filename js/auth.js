(() => {
    'use strict';

    const root = document.documentElement;
    const persist = (key, value) => { try { localStorage.setItem(key, value); } catch (_) { /* Storage can be unavailable. */ } };
    const stored = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } };

    const applyTheme = (theme) => {
        const dark = theme === 'dark';
        root.dataset.authTheme = dark ? 'dark' : 'light';
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(dark));
            button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
            const icon = button.querySelector('[data-theme-icon]');
            if (icon) {
                icon.classList.toggle('fa-moon', !dark);
                icon.classList.toggle('fa-sun', dark);
            }
        });
        persist('linguawave-theme', dark ? 'dark' : 'light');
    };
    const applyDirection = (direction) => {
        const rtl = direction === 'rtl';
        root.setAttribute('dir', rtl ? 'rtl' : 'ltr');
        document.querySelectorAll('[data-rtl-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(rtl));
            button.setAttribute('aria-label', `Switch to ${rtl ? 'left-to-right' : 'right-to-left'} layout`);
        });
        persist('linguawave-direction', rtl ? 'rtl' : 'ltr');
    };

    applyTheme(stored('linguawave-theme', 'light'));
    applyDirection(stored('linguawave-direction', 'ltr'));
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => applyTheme(root.dataset.authTheme === 'dark' ? 'light' : 'dark')));
    document.querySelectorAll('[data-rtl-toggle]').forEach((button) => button.addEventListener('click', () => applyDirection(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl')));

    document.querySelectorAll('[data-password-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            button.setAttribute('aria-pressed', String(show));
            button.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password`);
            button.innerHTML = show
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.2 4.1M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 3-.5"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
        });
    });

    const showStatus = (element, message, state = 'info') => {
        if (!element) return;
        element.textContent = message;
        element.dataset.state = state;
    };
    const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail');
        const password = document.getElementById('loginPassword');
        const status = document.getElementById('loginStatus');
        if (!email.value.trim() || !password.value) return showStatus(status, 'Enter your email address and password to continue.', 'error');
        if (!validEmail(email.value.trim())) return showStatus(status, 'Enter a valid email address.', 'error');
        showStatus(status, 'Your details are valid. Sign in will be available once account authentication is connected.', 'success');
    });

    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('fullName');
        const email = document.getElementById('registerEmail');
        const password = document.getElementById('registerPassword');
        const confirmation = document.getElementById('confirmPassword');
        const terms = document.getElementById('termsAccepted');
        const status = document.getElementById('registerStatus');
        if (!name.value.trim() || !email.value.trim() || !password.value || !confirmation.value) return showStatus(status, 'Complete all fields to continue.', 'error');
        if (!validEmail(email.value.trim())) return showStatus(status, 'Enter a valid work email address.', 'error');
        if (password.value.length < 8) return showStatus(status, 'Your password must be at least 8 characters long.', 'error');
        if (password.value !== confirmation.value) return showStatus(status, 'The passwords do not match. Check both fields and try again.', 'error');
        if (!terms.checked) return showStatus(status, 'Accept the Terms of Service to continue.', 'error');
        showStatus(status, 'Your details are valid. Account creation will be available once registration is connected.', 'success');
    });

    document.querySelector('[data-forgot-password]')?.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail');
        const status = document.getElementById('loginStatus');
        if (email?.value.trim() && validEmail(email.value.trim())) {
            showStatus(status, `Password reset is not connected yet. A reset link would be sent to ${email.value.trim()}.`, 'info');
        } else {
            showStatus(status, 'Enter your email address first. Password recovery will be available when connected.', 'info');
            email?.focus();
        }
    });
    document.querySelectorAll('[data-social]').forEach((button) => button.addEventListener('click', () => {
        const status = document.getElementById('loginStatus');
        showStatus(status, `${button.dataset.social} sign-in is a demo control. OAuth must be configured before it can authenticate.`, 'info');
    }));
    document.querySelectorAll('[data-placeholder]').forEach((link) => link.addEventListener('click', (event) => {
        event.preventDefault();
        const status = document.getElementById('registerStatus');
        showStatus(status, `${link.dataset.placeholder} content will be provided when the account service is connected.`, 'info');
    }));
})();
