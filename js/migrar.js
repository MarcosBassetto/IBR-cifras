// js/migrar.js - Script de migração do IndexedDB para o Firestore

async function migrarDados() {
    try {
        // 1. Buscar dados do IndexedDB usando a função antiga (main.js)
        // Se você ainda tiver o main.js carregado, use listarTodasCifras()
        // Ou implemente uma função específica para ler do IndexedDB
        const cifras = await listarTodasCifras();
        if (cifras.length === 0) {
            alert('Nenhuma cifra encontrada no IndexedDB para migrar.');
            return;
        }

        if (!confirm(`Deseja migrar ${cifras.length} cifras para o Firebase Firestore?`)) {
            return;
        }

        let sucessos = 0;
        let erros = 0;

        for (const cifra of cifras) {
            try {
                const { id, ...dadosSemId } = cifra;
                await db.collection('cifras').add(dadosSemId);
                sucessos++;
                console.log(`✅ Migrada: ${cifra.nome}`);
            } catch (error) {
                erros++;
                console.error(`❌ Erro ao migrar "${cifra.nome}":`, error);
            }
        }

        alert(`Migração concluída!\nSucessos: ${sucessos}\nErros: ${erros}`);
    } catch (error) {
        console.error('Erro na migração:', error);
        alert('Erro ao migrar dados. Veja o console para detalhes.');
    }
}

// Adiciona um botão no menu para iniciar a migração
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menuDropdown');
    if (menu) {
        const btnMigrar = document.createElement('a');
        btnMigrar.href = '#';
        btnMigrar.textContent = '🔄 Migrar para Firebase';
        btnMigrar.style.borderTop = '1px solid #3d3d3d';
        btnMigrar.addEventListener('click', (e) => {
            e.preventDefault();
            migrarDados();
        });
        menu.appendChild(btnMigrar);
    }
});
