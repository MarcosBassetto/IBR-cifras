// pesquisa.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-pesquisa');
    const campoSelect = document.getElementById('campo-busca');
    const termoInput = document.getElementById('termo-busca');
    const resultadosDiv = document.getElementById('resultados');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const campo = campoSelect.value;
        const termo = termoInput.value.trim();

        if (!termo) {
            mostrarToast('Digite um termo para pesquisar.', '#b33');
            return;
        }

        // Carregar todas as cifras
        const todas = await listarTodasCifras();

        // Normalizar termo
        const termoNormalizado = normalizarTexto(termo);

        // Filtrar
        const resultados = todas.filter(c => {
            let valor = '';
            if (campo === 'nome') valor = c.nome || '';
            else if (campo === 'interprete') valor = c.interprete || '';
            else if (campo === 'conteudo') valor = c.conteudo || '';

            const valorNormalizado = normalizarTexto(valor);
            return valorNormalizado.includes(termoNormalizado);
        });

        // Ordenar por nome
        resultados.sort((a, b) => a.nome.localeCompare(b.nome));

        exibirResultados(resultados, termo);
    });
});

// ============================================
// NORMALIZAÇÃO DE TEXTO
// ============================================
function normalizarTexto(texto) {
    if (!texto) return '';

    // 1. Remove acentos (normalização NFD)
    const semAcentos = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Converte para minúsculas
    const minusculas = semAcentos.toLowerCase();

    // 3. Substitui qualquer caractere que não seja letra, número ou espaço por espaço
    const limpo = minusculas.replace(/[^a-z0-9\s]/g, ' ');

    // 4. Remove espaços extras (múltiplos espaços -> um só) e trim
    const semEspacosExtras = limpo.replace(/\s+/g, ' ').trim();

    return semEspacosExtras;
}

// ============================================
// EXIBIR RESULTADOS EM TABELA
// ============================================
function exibirResultados(resultados, termo) {
    const container = document.getElementById('resultados');
    if (!container) return;

    if (resultados.length === 0) {
        container.innerHTML = `<p class="mensagem-vazia">Nenhuma cifra encontrada para "<strong>${termo}</strong>".</p>`;
        return;
    }

    // Cria a tabela
    let html = `
        <div class="tabela-wrapper">
            <table class="tabela-resultados">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Intérprete</th>
                        <th>Tom</th>
                        <th>Trecho</th>
                    </tr>
                </thead>
                <tbody>
    `;

    resultados.forEach(c => {
        // Trecho de até 200 caracteres
        let trecho = c.conteudo || '';
        if (trecho.length > 200) {
            trecho = trecho.substring(0, 200) + '...';
        }
        // Escapar HTML para evitar injeção
        trecho = escapeHtml(trecho);

        html += `
            <tr class="linha-resultado" data-id="${c.id}">
                <td class="nome-musica" data-id="${c.id}">${escapeHtml(c.nome)}</td>
                <td>${escapeHtml(c.interprete || '-')}</td>
                <td>${escapeHtml(c.tom || '-')}</td>
                <td class="trecho">${trecho}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    // ===== CLIQUE NA LINHA OU NO NOME =====
    container.querySelectorAll('.linha-resultado, .nome-musica').forEach(el => {
        el.addEventListener('click', (e) => {
            const id = parseInt(el.dataset.id);
            if (id && window.abrirModalDetalhes) {
                window.abrirModalDetalhes(id);
            }
        });
    });
}

// ============================================
// ESCAPAR HTML (segurança)
// ============================================
function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// EXPOR FUNÇÃO PARA O MODAL (global)
// ============================================
// A função abrirModalDetalhes está no index.js, mas precisamos
// que ela esteja disponível aqui. Como a página pesquisa carrega
// apenas o pesquisa.js, não temos acesso à função do index.js.
// Vamos criar uma cópia simplificada que usa o listarTodasCifras.

window.abrirModalDetalhes = async function(id) {
    const cifras = await listarTodasCifras();
    const cifra = cifras.find(c => c.id === id);
    if (!cifra) return;

    // Criar ou reutilizar modal
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-conteudo">
                <span class="fechar">&times;</span>
                <h3 id="modal-titulo-pesquisa"></h3>
                <p><strong>Intérprete:</strong> <span id="modal-interprete-pesquisa"></span></p>
                <div class="conteudo-completo" id="modal-conteudo-pesquisa"></div>
                <div id="modal-pdf-pesquisa"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.fechar').addEventListener('click', () => {
            overlay.classList.remove('ativo');
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('ativo');
        });
    }

    document.getElementById('modal-titulo-pesquisa').textContent = cifra.nome;
    document.getElementById('modal-interprete-pesquisa').textContent = cifra.interprete || 'Não informado';
    document.getElementById('modal-conteudo-pesquisa').textContent = cifra.conteudo || 'Conteúdo não disponível';

    const pdfDiv = document.getElementById('modal-pdf-pesquisa');
    pdfDiv.innerHTML = '';
    if (cifra.pdfBase64) {
        // Botão Baixar
        const linkDownload = document.createElement('a');
        linkDownload.href = `data:application/pdf;base64,${cifra.pdfBase64}`;
        linkDownload.download = `${cifra.nome}.pdf`;
        linkDownload.className = 'btn-baixar-pdf';
        linkDownload.textContent = '📄 Baixar PDF';

        // Botão Visualizar
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
        pdfDiv.innerHTML = '<p style="color:var(--text-muted);">Nenhum PDF anexado.</p>';
    }

    overlay.classList.add('ativo');
};
