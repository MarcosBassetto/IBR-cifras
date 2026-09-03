// js/firebase.js - Substitui as funções do IndexedDB pelo Firestore

// Salvar cifra no Firestore
async function salvarCifra(dados) {
    try {
        const docRef = await db.collection('cifras').add(dados);
        console.log('✅ Cifra salva no Firestore (ID:', docRef.id, ')');
        return docRef.id;
    } catch (error) {
        console.error('❌ Erro ao salvar no Firestore:', error);
        throw error;
    }
}

// Listar todas as cifras do Firestore
async function listarTodasCifras() {
    try {
        const snapshot = await db.collection('cifras').orderBy('nome').get();
        const cifras = [];
        snapshot.forEach(doc => {
            cifras.push({ id: doc.id, ...doc.data() });
        });
        console.log('📋 Cifras carregadas do Firestore:', cifras.length);
        return cifras;
    } catch (error) {
        console.error('❌ Erro ao listar do Firestore:', error);
        return [];
    }
}

// Deletar cifra do Firestore
async function deletarCifra(id) {
    try {
        await db.collection('cifras').doc(id).delete();
        console.log('🗑️ Cifra deletada do Firestore (ID:', id, ')');
    } catch (error) {
        console.error('❌ Erro ao deletar do Firestore:', error);
        throw error;
    }
}

// Atualizar cifra no Firestore (opcional)
async function atualizarCifra(id, dados) {
    try {
        await db.collection('cifras').doc(id).update(dados);
        console.log('✏️ Cifra atualizada no Firestore (ID:', id, ')');
    } catch (error) {
        console.error('❌ Erro ao atualizar no Firestore:', error);
        throw error;
    }
}

// Função de backup para manter compatibilidade
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

