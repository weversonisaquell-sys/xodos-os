const Apps = {
    open(id) {
        const win = document.getElementById('win-' + id);
        if (win) { win.classList.remove('minimized'); win.style.zIndex = Date.now(); }
    },
    close(id) { document.getElementById('win-' + id).classList.add('minimized'); },
    
    toggleStartMenu(event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById('startMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    },

    closeStartMenu() {
        const menu = document.getElementById('startMenu');
        if (menu) {
            menu.classList.add('hidden');
        }
    },
    
    firefoxHome() {
        document.getElementById('firefoxHome').style.display = 'flex';
        document.getElementById('browserIframe').style.display = 'none';
        document.getElementById('browserUrl').value = '';
    },
    
    openFxSite(url) {
        document.getElementById('firefoxHome').style.display = 'none';
        const iframe = document.getElementById('browserIframe');
        iframe.style.display = 'block';
        iframe.removeAttribute('srcdoc');
        iframe.src = url;
        document.getElementById('browserUrl').value = url;
    },
    
    searchFx(query) {
        if (!query.trim()) return;
        document.getElementById('firefoxHome').style.display = 'none';
        const iframe = document.getElementById('browserIframe');
        iframe.style.display = 'block';
        
        const qEnc = encodeURIComponent(query);
        const qClean = query.trim();

        const sitesTemplates = [
            { name: "Wikipédia (PT)", url: `https://pt.wikipedia.org/wiki/${qEnc}`, desc: `Enciclopédia livre com artigos detalhados sobre ${qClean}.` },
            { name: "Wikipédia (EN)", url: `https://en.wikipedia.org/wiki/${qEnc}`, desc: `Global encyclopedia entries and academic references for ${qClean}.` },
            { name: "Wikiquote", url: `https://pt.wikiquote.org/wiki/${qEnc}`, desc: `Coleção de citações e frases célebres relacionadas a ${qClean}.` },
            { name: "GitHub Repositories", url: `https://github.com/search?q=${qEnc}`, desc: `Códigos, projetos open-source e ferramentas sobre ${qClean}.` },
            { name: "Stack Overflow", url: `https://stackoverflow.com/search?q=${qEnc}`, desc: `Discussões técnicas, perguntas e respostas de desenvolvedores sobre ${qClean}.` },
            { name: "MDN Web Docs", url: `https://developer.mozilla.org/search?q=${qEnc}`, desc: `Documentação oficial para desenvolvedores web acerca de ${qClean}.` },
            { name: "W3Schools Reference", url: `https://www.w3schools.com/sitemap.asp`, desc: `Tutoriais práticos e referências de programação para ${qClean}.` },
            { name: "Reddit Community", url: `https://www.reddit.com/search/?q=${qEnc}`, desc: `Discussões da comunidade, fóruns e opiniões de usuários sobre ${qClean}.` },
            { name: "Internet Archive", url: `https://archive.org/search.php?query=${qEnc}`, desc: `Biblioteca digital de textos, livros históricos e arquivos sobre ${qClean}.` },
            { name: "Wiktionary", url: `https://pt.wiktionary.org/wiki/${qEnc}`, desc: `Significado, etimologia e definições linguísticas de ${qClean}.` },
            { name: "Dev.to Articles", url: `https://dev.to/search?q=${qEnc}`, desc: `Artigos, posts e blogs criados por programadores sobre ${qClean}.` },
            { name: "GeeksforGeeks", url: `https://www.geeksforgeeks.org/?s=${qEnc}`, desc: `Artigos de ciência da computação e algoritmos focados em ${qClean}.` },
            { name: "Wikimedia Commons", url: `https://commons.wikimedia.org/wiki/Special:Search?q=${qEnc}`, desc: `Banco de imagens, mídias e arquivos multimídia sobre ${qClean}.` },
            { name: "Open Library", url: `https://openlibrary.org/search?q=${qEnc}`, desc: `Livros e publicações digitalizadas relacionados ao tema ${qClean}.` },
            { name: "YouTube Web Player", url: `https://www.youtube.com/embed/results?search_query=${qEnc}`, desc: `Vídeos, videoaulas e conteúdos audiovisuais sobre ${qClean}.` }
        ];

        let resultsCardsHtml = '';
        sitesTemplates.forEach((site, index) => {
            resultsCardsHtml += `
                <div class="result-card">
                    <div class="result-url">${site.url}</div>
                    <div class="result-title" onclick="window.parent.Apps.handleSiteOpen('${site.url}')">
                        ${index + 1}. ${site.name} — Resultados para "${qClean}"
                    </div>
                    <div class="result-snippet">${site.desc}</div>
                </div>
            `;
        });

        const resultsHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #120c1f; color: #fff; padding: 20px; margin: 0; }
                    h3 { color: #00E5C7; margin-bottom: 5px; font-size: 16px; }
                    .search-container { max-width: 700px; margin: 0 auto; }
                    .result-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(123,92,255,0.25); padding: 12px 15px; border-radius: 8px; margin-bottom: 12px; transition: 0.2s; }
                    .result-card:hover { background: rgba(255,255,255,0.08); border-color: #7B5CFF; }
                    .result-title { color: #7B5CFF; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 3px; }
                    .result-title:hover { text-decoration: underline; color: #00E5C7; }
                    .result-url { color: #00E5C7; font-size: 10px; margin-bottom: 4px; font-family: monospace; opacity: 0.8; }
                    .result-snippet { color: #ccc; font-size: 11px; }
                    .counter-info { font-size: 11px; opacity: 0.7; margin-bottom: 15px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="search-container">
                    <h3>Resultados de Pesquisa</h3>
                    <div class="counter-info">Mostrando 15 fontes relacionadas a: "${qClean}"</div>
                    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin-bottom:15px;">
                    ${resultsCardsHtml}
                </div>
            </body>
            </html>
        `;
        
        iframe.srcdoc = resultsHtml;
        document.getElementById('browserUrl').value = query;
    },

    handleSiteOpen(url) {
        const iframe = document.getElementById('browserIframe');
        iframe.removeAttribute('srcdoc');
        iframe.src = url;
        document.getElementById('browserUrl').value = url;

        setTimeout(() => {
            try {
                if (iframe.contentWindow.location.href === "about:blank") {
                    window.open(url, '_blank');
                }
            } catch (e) {
                window.open(url, '_blank');
            }
        }, 800);
    },
    
    navigateBrowser() {
        const urlInput = document.getElementById('browserUrl').value;
        if (!urlInput.trim()) return;
        
        if (!urlInput.includes('.') || urlInput.includes(' ')) {
            this.searchFx(urlInput);
            return;
        }

        let targetUrl = urlInput.trim();
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
        this.handleSiteOpen(targetUrl);
    },

    loadDirectory(event) {
        const files = event.target.files;
        const grid = document.getElementById('fileManagerGrid');
        grid.innerHTML = '';
        Array.from(files).forEach(file => {
            const fileEl = document.createElement('div');
            fileEl.className = 'icon-file';
            fileEl.innerHTML = `<span>📄</span><span>${file.name}</span>`;
            if (file.type.startsWith('image/')) {
                fileEl.onclick = () => {
                    document.getElementById('photoViewerImg').src = URL.createObjectURL(file);
                    this.open('photo-viewer');
                };
            }
            grid.appendChild(fileEl);
        });
    },

    resetFileView() {
        document.getElementById('fileManagerGrid').innerHTML = '<p style="padding:10px">Selecione uma pasta para ver o conteúdo.</p>';
    }
};
