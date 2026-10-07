// References:
// MDN Web Docs (n.d.) Using the Fetch API.
// Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// MDN Web Docs (n.d.) Window.localStorage.
// Available at: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// FreeAPI (n.d.) Public Quotes API.
// Available at: https://api.freeapi.app/#/Public%20APIs/getQuotes

document.addEventListener('DOMContentLoaded', () => {

    const quoteForm = document.getElementById('quoteForm');
    const categorySelect = document.getElementById('quote-category');
    const countInput = document.getElementById('quote-count');
    const quoteStatus = document.getElementById('quoteStatus');
    const quoteResults = document.getElementById('quoteResults');
    const savedQuotes = document.getElementById('savedQuotes');
    const clearSaved = document.getElementById('clearSaved');

    if (!quoteForm) return;

    const STORAGE_KEY = 'studyStreamSavedQuotes';

    // Large curated library of quotes, organised by category
    const QUOTE_LIBRARY = {
        inspirational: [
            { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
            { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
            { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
            { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' },
            { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
            { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' }
        ],
        success: [
            { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
            { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau' },
            { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
            { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
            { text: 'I find that the harder I work, the more luck I seem to have.', author: 'Thomas Jefferson' }
        ],
        education: [
            { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
            { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
            { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
            { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
            { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' }
        ],
        life: [
            { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
            { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
            { text: 'Life is really simple, but we insist on making it complicated.', author: 'Confucius' },
            { text: 'The purpose of our lives is to be happy.', author: 'Dalai Lama' },
            { text: 'Get busy living or get busy dying.', author: 'Stephen King' }
        ],
        motivational: [
            { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
            { text: 'The harder you work for something, the greater you will feel when you achieve it.', author: 'Unknown' },
            { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
            { text: 'Great things never come from comfort zones.', author: 'Unknown' },
            { text: 'Dream it. Wish it. Do it.', author: 'Unknown' }
        ]
    };

    // ---------- Load saved quotes on page load ----------
    renderSavedQuotes();

    // ---------- Handle form submit ----------
    quoteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const category = categorySelect.value;
        const count = Math.min(Math.max(parseInt(countInput.value, 10) || 1, 1), 5);

        quoteStatus.textContent = `Generating ${count} quote(s) for you...`;
        quoteStatus.className = 'status-message loading';
        quoteResults.innerHTML = '';

        // Small delay to feel like it's "working"
        setTimeout(() => {
            const quotes = getQuotes(category, count);
            quoteStatus.textContent = `Here are ${quotes.length} quote(s) to inspire you.`;
            quoteStatus.className = 'status-message success';
            renderQuotes(quotes, quoteResults);
        }, 300);
    });

    // ---------- Get randomised quotes from the library ----------
    function getQuotes(category, count) {
        const pool = QUOTE_LIBRARY[category] || QUOTE_LIBRARY.inspirational;

        // Shuffle a copy of the pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);

        // Take the requested number of quotes
        return shuffled.slice(0, count);
    }

    // ---------- Render quote cards ----------
    function renderQuotes(quotes, container) {
        container.innerHTML = '';

        quotes.forEach((quote) => {
            const card = document.createElement('article');
            card.className = 'quote-card';
            card.innerHTML = `
                <blockquote>&ldquo;${escapeHTML(quote.text)}&rdquo;</blockquote>
                <p class="quote-author">&mdash; ${escapeHTML(quote.author)}</p>
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
        const exists = saved.some((q) => q.text === quote.text && q.author === quote.author);

        if (!exists) {
            saved.push(quote);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            renderSavedQuotes();
        }
    }

    // ---------- Get saved quotes ----------
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
                <blockquote>&ldquo;${escapeHTML(quote.text)}&rdquo;</blockquote>
                <p class="quote-author">&mdash; ${escapeHTML(quote.author)}</p>
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