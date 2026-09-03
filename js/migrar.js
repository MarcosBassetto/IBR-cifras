// js/migrar.js - Script de migração do IndexedDB para o Firestore
// (Não depende de funções externas)

// ============================================
// 1. FUNÇÃO PARA LER DO INDEXEDDB
// ============================================
function listarDoIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CifrasDB', 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction('cifras', 'readonly');
            const store = tx.objectStore('cifras');
            const req = store.getAll();
            req.onsuccess = () => {
                console.log('📋 Cifras lidas do IndexedDB:', req.result.length);
                resolve(req.result);
            };
            req.onerror = () => {
                console.error('❌ Erro ao ler IndexedDB:', req.error);
                reject(req.error);
            };
        };
        request.onerror = () => {
            console.error('❌ Erro ao abrir IndexedDB:', request.error);
            reject(request.error);
        };
    });
}

// ============================================
// 2. FUNÇÃO DE MIGRAÇÃO
// ============================================
async function migrarDados() {
    try {
        // 1. Buscar dados do IndexedDB
        const cifras = await listarDoIndexedDB();
        if (cifras.length === 0) {
            alert('Nenhuma cifra encontrada no IndexedDB para migrar.');
            return;
        }

        // 2. Confirmar migração
        if (!confirm(`Deseja migrar ${cifras.length} cifras para o Firebase Firestore?`)) {
            return;
        }

        // 3. Enviar cada cifra para o Firestore
        let sucessos = 0;
        let erros = 0;

        for (const cifra of cifras) {
            try {
                // Remove o campo 'id' (que era auto-increment do IndexedDB)
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

// ============================================
// 3. ADICIONAR BOTÃO NO MENU
// ============================================
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
