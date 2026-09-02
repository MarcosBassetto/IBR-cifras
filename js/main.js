// main.js - funções compartilhadas (compatível com Firefox)

function abrirBD() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CifrasDB', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('cifras')) {
                const store = db.createObjectStore('cifras', { keyPath: 'id', autoIncrement: true });
                store.createIndex('nome', 'nome', { unique: false });
                store.createIndex('interprete', 'interprete', { unique: false });
                console.log('✅ Banco criado/atualizado.');
            }
        };
        request.onsuccess = () => {
            console.log('✅ Banco aberto.');
            resolve(request.result);
        };
        request.onerror = () => {
            console.error('❌ Erro ao abrir banco:', request.error);
            reject(request.error);
        };
    });
}

async function salvarCifra(dados) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirBD();
            const tx = db.transaction('cifras', 'readwrite');
            const store = tx.objectStore('cifras');
            const request = store.add(dados);

            // Aguarda a adição
            request.onsuccess = () => {
                console.log('✅ Cifra adicionada (ID:', request.result, ')');
            };
            request.onerror = () => {
                console.error('❌ Erro ao adicionar:', request.error);
                reject(request.error);
            };

            // Aguarda a transação completar
            tx.oncomplete = () => {
                console.log('✅ Transação concluída.');
                resolve();
            };
            tx.onerror = () => {
                console.error('❌ Erro na transação:', tx.error);
                reject(tx.error);
            };
        } catch (error) {
            console.error('❌ Erro em salvarCifra:', error);
            reject(error);
        }
    });
}

async function listarTodasCifras() {
    return new Promise(async (resolve) => {
        try {
            const db = await abrirBD();
            const tx = db.transaction('cifras', 'readonly');
            const store = tx.objectStore('cifras');
            const req = store.getAll();
            req.onsuccess = () => {
                console.log('📋 Cifras carregadas:', req.result.length);
                resolve(req.result);
            };
            req.onerror = () => {
                console.error('❌ Erro ao listar:', req.error);
                resolve([]);
            };
        } catch (error) {
            console.error('❌ Erro em listarTodasCifras:', error);
            resolve([]);
        }
    });
}

async function deletarCifra(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirBD();
            const tx = db.transaction('cifras', 'readwrite');
            const store = tx.objectStore('cifras');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('🗑️ Cifra deletada (ID:', id, ')');
            };
            request.onerror = () => {
                console.error('❌ Erro ao deletar:', request.error);
                reject(request.error);
            };

            tx.oncomplete = () => {
                console.log('✅ Transação de deleção concluída.');
                resolve();
            };
            tx.onerror = () => {
                console.error('❌ Erro na transação de deleção:', tx.error);
                reject(tx.error);
            };
        } catch (error) {
            console.error('❌ Erro em deletarCifra:', error);
            reject(error);
        }
    });
}

function mostrarToast(mensagem, cor = '#40E0D0') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.style.borderLeftColor = cor;
    toast.style.background = '#2b2b2b';
    toast.style.color = '#fff';
    toast.classList.add('visivel');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visivel'), 3000);
}
