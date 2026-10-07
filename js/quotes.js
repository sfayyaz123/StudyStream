// References:
// FreeAPI (n.d.) Public Quotes API.
// Available at: https://api.freeapi.app/#/Public%20APIs/getQuotes
// MDN Web Docs (n.d.) Window.localStorage.
// Available at: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// =========================================
// StudyStream - quotes.js
// Uses the FreeAPI Quotes API (free, no key required)
// Endpoint: https://api.freeapi.app/api/v1/public/quotes
// Includes localStorage support for saving favourite quotes
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    const quoteForm = document.getElementById('quoteForm');
    const categorySelect = document.getElementById('quote-category');
    const countInput = document.getElementById('quote-count');
    const quoteStatus = document.getElementById('quoteStatus');
    const quoteResults = document.getElementById('quoteResults');
    const savedQuotes = document.getElementById('savedQuotes');
    const clearSaved = document.getElementById('clearSaved');

    if (!quoteForm) return;

    // ---------- localStorage key ----------
    const STORAGE_KEY = 'studyStreamSavedQuotes';

    // ---------- Load saved quotes on page load ----------
    renderSavedQuotes();

    // ---------- Handle form submit ----------
    quoteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const category = categorySelect.value;
        const count = Math.min(Math.max(parseInt(countInput.value, 10) || 1, 1), 5);

        quoteStatus.textContent = 'Finding quotes...';
        quoteStatus.className = 'status-message loading';
        quoteResults.innerHTML = '';

        try {
            // Use FreeAPI Quotes API (free, no key required)
            const quotes = [];
            const apiUrl = `https://api.freeapi.app/api/v1/public/quotes?limit=${count}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const result = await response.json();
            const data = result && result.data && result.data.data;

            if (Array.isArray(data)) {
                data.forEach((item) => {
                    if (item && item.content) {
                        quotes.push({
                            text: item.content,
                            author: item.author || 'Unknown'
                        });
                    }
                });
            }

            if (quotes.length === 0) {
                throw new Error('No quotes returned');
            }

            quoteStatus.textContent = `Here are ${quotes.length} quote(s) to inspire you.`;
            quoteStatus.className = 'status-message success';

            renderQuotes(quotes, quoteResults);

        } catch (error) {
            console.error('Quote fetch failed:', error);
            quoteStatus.textContent = 'Using offline quotes (API unavailable).';
            quoteStatus.className = 'status-message';

            const fallback = getFallbackQuotes(category, count);
            renderQuotes(fallback, quoteResults);
        }
    });

    // ---------- Render quote cards into a container ----------
    function renderQuotes(quotes, container) {
        container.innerHTML = '';

        quotes.forEach((quote) => {
            const card = document.createElement('article');
            card.className = 'quote-card';
            card.innerHTML = `
                <blockquote>“${escapeHTML(quote.text)}”</blockquote>
                <p class="quote-author">— ${escapeHTML(quote.author)}</p>
                <button class="btn btn-secondary save-quote-btn" type="button">Save quote</button>
            `;

            const saveBtn = card.querySelector('.save-quote-btn');
            saveBtn.addEventListener('click', () => {
                saveQuote(quote);
                saveBtn.textContent = 'Saved!';
                saveBtn.disabled = true;
            });

            container.appendChild(card);
        });
    }

    // ---------- Save a quote to localStorage ----------
    function saveQuote(quote) {
        const saved = getSavedQuotes();

        const exists = saved.some(
            (q) => q.text === quote.text && q.author === quote.author
        );

        if (!exists) {
            saved.push(quote);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            renderSavedQuotes();
        }
    }

    // ---------- Get saved quotes from localStorage ----------
    function getSavedQuotes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    // ---------- Render saved quotes ----------
    function renderSavedQuotes() {
        const saved = getSavedQuotes();
        savedQuotes.innerHTML = '';

        if (saved.length === 0) {
            savedQuotes.innerHTML = '<p class="status-message">No saved quotes yet. Generate some above and click "Save quote".</p>';
            return;
        }

        saved.forEach((quote, index) => {
            const card = document.createElement('article');
            card.className = 'quote-card';
            card.innerHTML = `
                <blockquote>“${escapeHTML(quote.text)}”</blockquote>
                <p class="quote-author">— ${escapeHTML(quote.author)}</p>
                <button class="btn btn-secondary remove-quote-btn" type="button" data-index="${index}">Remove</button>
            `;

            card.querySelector('.remove-quote-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                removeSavedQuote(idx);
            });

            savedQuotes.appendChild(card);
        });
    }

    // ---------- Remove a saved quote ----------
    function removeSavedQuote(index) {
        const saved = getSavedQuotes();
        saved.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        renderSavedQuotes();
    }

    // ---------- Clear all saved quotes ----------
    clearSaved.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all saved quotes?')) {
            localStorage.removeItem(STORAGE_KEY);
            renderSavedQuotes();
        }
    });

    // ---------- Fallback quotes (offline) ----------
    function getFallbackQuotes(category, count) {
        const localLibrary = {
            inspirational: [
                { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
                { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
                { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' }
            ],
            success: [
                { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
                { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau' }
            ],
            education: [
                { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
                { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' }
            ],
            life: [
                { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
                { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' }
            ],
            motivational: [
                { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
                { text: 'The harder you work for something, the greater you will feel when you achieve it.', author: 'Unknown' }
            ]
        };

        const pool = localLibrary[category] || localLibrary.inspirational;
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(pool[i % pool.length]);
        }
        return results;
    }

    // ---------- Escape HTML for safety ----------
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

});