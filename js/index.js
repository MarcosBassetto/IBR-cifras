// index.js (versão completa com visualização do PDF e edição)

let todasCifras = [];
let filtroLetra = '';

document.addEventListener('DOMContentLoaded', async () => {
    await carregarCifras();
    configurarFiltroAlfabetico();
});

// ============================================
// CARREGAR CIFRAS E RENDERIZAR
// ============================================
async function carregarCifras() {
    todasCifras = await listarTodasCifras();
    todasCifras.sort((a, b) => a.nome.localeCompare(b.nome));
    atualizarContador();
    renderizarCards();
}

function atualizarContador() {
    const contadorSpan = document.getElementById('contador-numero');
    if (contadorSpan) contadorSpan.textContent = todasCifras.length;
}

// ============================================
// FILTRO ALFABÉTICO
// ============================================
function configurarFiltroAlfabetico() {
    const letras = document.querySelectorAll('.indice-alfabetico span');
    letras.forEach(el => {
        el.addEventListener('click', () => {
            const letra = el.dataset.letra;
            if (filtroLetra === letra) {
                filtroLetra = '';
                letras.forEach(l => l.classList.remove('ativo'));
            } else {
                filtroLetra = letra;
                letras.forEach(l => l.classList.remove('ativo'));
                el.classList.add('ativo');
            }
            renderizarCards();
        });
    });
}

// ============================================
// RENDERIZAR CARDS (com filtro)
// ============================================
function renderizarCards() {
    const container = document.getElementById('lista-cifras');
    if (!container) return;

    let cifrasFiltradas = todasCifras;
    if (filtroLetra) {
        cifrasFiltradas = todasCifras.filter(c =>
            c.nome.charAt(0).toUpperCase() === filtroLetra
        );
    }

    if (cifrasFiltradas.length === 0) {
        container.innerhtml = `<p class="mensagem-vazia">${
            filtroLetra ? `Nenhuma cifra com a letra "${filtroLetra}".` : 'Nenhuma cifra cadastrada ainda.'
        }</p>`;
        return;
    }

    container.innerhtml = cifrasFiltradas.map(c => `
        <div class="card-cifra" data-id="${c.id}">
            <div class="card-header">
                <h3 style="cursor:pointer;" data-id="${c.id}">${c.nome}</h3>
                <!-- Ícone de documento (edição) -->
                <svg class="icone-outline icone-documento" data-id="${c.id}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none" style="cursor:pointer;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            </div>
            <div class="card-footer">
                <svg class="icone-outline icone-chama" data-id="${c.id}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none">
                    <path d="M12 23c-4 0-7-3-7-7 0-4 7-12 7-12s7 8 7 12c0 4-3 7-7 7z" />
                    <title>${c.interprete || 'Intérprete não informado'}</title>
                </svg>
                <div class="acoes-wrapper">
                    <button class="btn-acoes-toggle" data-id="${c.id}">•••</button>
                    <div class="acoes-expandidas" data-id="${c.id}">
                        <button class="btn-acao" data-id="${c.id}" data-acao="visualizar">👁️</button>
                        <button class="btn-acao" data-id="${c.id}" data-acao="editar">✏️</button>
                        <button class="btn-acao" data-id="${c.id}" data-acao="excluir">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // ===== CLIQUE NO H3 (abrir modal) =====
    container.querySelectorAll('.card-header h3').forEach(title => {
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(title.dataset.id);
            abrirModalDetalhes(id);
        });
    });

    // ===== EVENTO DO DOCUMENTO (editar) =====
    document.querySelectorAll('.icone-documento').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = icon.dataset.id;
            sessionStorage.setItem('cifraId', id);
            sessionStorage.setItem('modoEdicao', 'true');
            window.location.href = 'html/enviar.html';
        });
    });

    // ===== TOGGLE DAS AÇÕES =====
    document.querySelectorAll('.btn-acoes-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const expandidas = document.querySelector(`.acoes-expandidas[data-id="${id}"]`);
            if (expandidas) {
                expandidas.classList.toggle('aberto');
                btn.textContent = expandidas.classList.contains('aberto') ? '✕' : '•••';
            }
        });
    });

    // ===== EVENTOS DAS AÇÕES =====
    document.querySelectorAll('.btn-acao').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const acao = btn.dataset.acao;

            const expandidas = document.querySelector(`.acoes-expandidas[data-id="${id}"]`);
            if (expandidas) {
                expandidas.classList.remove('aberto');
                const toggle = document.querySelector(`.btn-acoes-toggle[data-id="${id}"]`);
                if (toggle) toggle.textContent = '•••';
            }

            switch (acao) {
                case 'visualizar':
                    abrirModalDetalhes(id);
                    break;
                case 'editar':
                    sessionStorage.setItem('cifraId', id);
                    sessionStorage.setItem('modoEdicao', 'true');
                    window.location.href = 'html/enviar.html';
                    break;
                case 'excluir':
                    if (confirm('Tem certeza que deseja excluir esta cifra?')) {
                        await deletarCifra(id);
                        mostrarToast('Cifra excluída com sucesso!', '#40E0D0');
                        await carregarCifras();
                    }
                    break;
            }
        });
    });

    // Fechar ações ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.acoes-expandidas.aberto').forEach(el => {
            el.classList.remove('aberto');
            const id = el.dataset.id;
            const toggle = document.querySelector(`.btn-acoes-toggle[data-id="${id}"]`);
            if (toggle) toggle.textContent = '•••';
        });
    });
}

// ============================================
// MODAL DE DETALHES (com visualização do PDF)
// ============================================
async function abrirModalDetalhes(id) {
    const cifra = todasCifras.find(c => c.id === id);
    if (!cifra) return;

    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-titulo').textContent = cifra.nome;
    document.getElementById('modal-interprete').textContent = cifra.interprete || 'Não informado';
    document.getElementById('modal-conteudo').textContent = cifra.conteudo || 'Conteúdo não disponível';

    const pdfDiv = document.getElementById('modal-pdf');
    pdfDiv.innerhtml = '';

    if (cifra.pdfBase64) {
        // Botão para baixar
        const linkDownload = document.createElement('a');
        linkDownload.href = `data:application/pdf;base64,${cifra.pdfBase64}`;
        linkDownload.download = `${cifra.nome}.pdf`;
        linkDownload.className = 'btn-baixar-pdf';
        linkDownload.textContent = '📄 Baixar PDF';

        // Botão para visualizar em nova aba
        const linkVisualizar = document.createElement('a');
        linkVisualizar.className = 'btn-baixar-pdf btn-visualizar-pdf';
        linkVisualizar.textContent = '👁️ Visualizar PDF';
        linkVisualizar.style.marginLeft = '10px';

        linkVisualizar.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const byteCharacters = atob(cifra.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            } catch (error) {
                console.error('Erro ao visualizar PDF:', error);
                mostrarToast('Erro ao abrir o PDF.', '#b33');
            }
        });

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.marginTop = '10px';
        container.style.flexWrap = 'wrap';
        container.appendChild(linkDownload);
        container.appendChild(linkVisualizar);
        pdfDiv.appendChild(container);
    } else {
        pdfDiv.innerhtml = '<p style="color:var(--text-muted);">Nenhum PDF anexado.</p>';
    }

    overlay.classList.add('ativo');
}

// Fechar modal
document.getElementById('modal-fechar').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('ativo');
});
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove('ativo');
    }
});
