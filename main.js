// References:
// MDN Web Docs (n.d.) Introduction to events.
// Available at: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events
// MDN Web Docs (n.d.) Document: DOMContentLoaded event.
// Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// =========================================
// StudyStream - main.js
// Handles navigation toggle and newsletter form
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Mobile navigation toggle ----------
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = primaryNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // ---------- Newsletter form validation ----------
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletterMessage');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = document.getElementById('newsletter-name').value.trim();
            const email = document.getElementById('newsletter-email').value.trim();
            const interest = document.getElementById('newsletter-interest').value;

            // Simple validation
            if (!name || !email || !interest) {
                newsletterMessage.textContent = 'Please fill in all fields.';
                newsletterMessage.className = 'form-message error';
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                newsletterMessage.textContent = 'Please enter a valid email address.';
                newsletterMessage.className = 'form-message error';
                return;
            }

            // Success
            newsletterMessage.textContent = `Thanks, ${name}! You're subscribed.`;
            newsletterMessage.className = 'form-message success';
            newsletterForm.reset();
        });
    }

});