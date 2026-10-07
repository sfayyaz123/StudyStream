// References:
// MDN Web Docs (n.d.) Using the Fetch API.
// Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Open Library API (n.d.) Search API.
// Available at: https://openlibrary.org/developers/api
// =========================================
// StudyStream - books.js
// Handles the Book Finder using the Open Library API
// API Docs: https://openlibrary.org/developers/api
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.getElementById('bookSearchForm');
    const searchType = document.getElementById('search-type');
    const searchQuery = document.getElementById('search-query');
    const resultLimit = document.getElementById('result-limit');
    const bookStatus = document.getElementById('bookStatus');
    const bookResults = document.getElementById('bookResults');

    if (!searchForm) return;

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // ---------- Validate input ----------
        const query = searchQuery.value.trim();
        const type = searchType.value;
        const limit = parseInt(resultLimit.value, 10) || 10;

        if (query.length < 2) {
            bookStatus.textContent = 'Please enter at least 2 characters.';
            bookStatus.className = 'status-message error';
            bookResults.innerHTML = '';
            return;
        }

        // ---------- Show loading state ----------
        bookStatus.textContent = 'Searching for books...';
        bookStatus.className = 'status-message loading';
        bookResults.innerHTML = '';

        try {
            // ---------- Build API URL ----------
            // The Open Library search API:
            // https://openlibrary.org/search.json?title=... OR ?author=...
            const encodedQuery = encodeURIComponent(query);
            const field = type === 'author' ? 'author' : 'title';
            const url = `https://openlibrary.org/search.json?${field}=${encodedQuery}&limit=${limit}`;

            // ---------- Fetch data ----------
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // ---------- Handle empty results ----------
            if (!data.docs || data.docs.length === 0) {
                bookStatus.textContent = `No books found for "${query}". Try a different search.`;
                bookStatus.className = 'status-message error';
                return;
            }

            // ---------- Display results ----------
            bookStatus.textContent = `Found ${data.docs.length} result(s) for "${query}".`;
            bookStatus.className = 'status-message success';

            renderBooks(data.docs);

        } catch (error) {
            console.error('Book search failed:', error);
            bookStatus.textContent = 'Something went wrong. Please try again later.';
            bookStatus.className = 'status-message error';
        }
    });

    // ---------- Render book cards ----------
    function renderBooks(books) {
        bookResults.innerHTML = '';

        books.forEach((book) => {
            const title = book.title || 'Untitled';
            const author = book.author_name ? book.author_name.join(', ') : 'Unknown author';
            const year = book.first_publish_year ? `First published: ${book.first_publish_year}` : 'Year unknown';

            // Build cover image URL if cover ID exists
            let coverHTML = '<div class="book-cover-placeholder" aria-hidden="true">📖</div>';
            if (book.cover_i) {
                const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                coverHTML = `<img src="${coverUrl}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
            }

            // Create the card
            const card = document.createElement('article');
            card.className = 'book-card';
            card.innerHTML = `
                ${coverHTML}
                <div class="book-info">
                    <h3>${escapeHTML(title)}</h3>
                    <p class="book-author">${escapeHTML(author)}</p>
                    <p class="book-year">${escapeHTML(year)}</p>
                </div>
            `;

            bookResults.appendChild(card);
        });
    }

    // ---------- Simple HTML escape for safety ----------
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

});