const CHAVE = 'listasTreino';

const form = document.getElementById('form-lista');
const nomeLista = document.getElementById('nome-lista');
const btnAdd = document.getElementById('btn-add');
const ul = document.getElementById('lista-exercicios');
const vazio = document.getElementById('vazio');
const msg = document.getElementById('msg');
const tpl = document.getElementById('tpl-exercicio');

let exercicios = [];

// --- localStorage guarda só texto, então convertemos com JSON ---
function lerListas() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE)) ?? [];
    } catch {
        return []; // dado corrompido: começa do zero em vez de quebrar a página
    }
}

function novoId() {
    return crypto.randomUUID?.() ?? String(Date.now());
}

function mostrarMsg(texto, erro = false) {
    msg.textContent = texto;
    msg.className = erro ? 'erro' : 'ok';
    msg.hidden = false;
}

// --- desenha a lista a partir do array, usando o <template> ---
function desenhar() {
    ul.replaceChildren();
    exercicios.forEach((ex) => {
        const item = tpl.content.cloneNode(true);
        item.querySelector('.item').dataset.id = ex.id;
        item.querySelector('.item-nome').textContent = ex.nome;
        const carga = ex.carga !== null ? ` com ${ex.carga} kg` : '';
        item.querySelector('.item-meta').textContent = `${ex.series} séries de ${ex.reps}${carga}`;
        ul.append(item);
    });
    vazio.hidden = exercicios.length > 0;
}

function adicionar() {
    const campos = [...form.querySelectorAll('.novo-exercicio input')];
    // reportValidity mostra o aviso do navegador no primeiro campo inválido
    if (!campos.every((c) => c.reportValidity())) return;

    const dados = Object.fromEntries(new FormData(form));
    exercicios.push({
        id: novoId(),
        nome: dados.exercicio.trim(),
        series: Number(dados.series),
        reps: Number(dados.reps),
        carga: dados.carga ? Number(dados.carga) : null,
    });

    campos.forEach((c) => (c.value = ''));
    campos[0].focus();
    msg.hidden = true;
    desenhar();
}

btnAdd.addEventListener('click', adicionar);

// Enter dentro dos campos do exercício adiciona, em vez de enviar o formulário
form.querySelector('.novo-exercicio').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionar();
    }
});

// --- um único listener na <ul> cuida de todos os botões "Remover" ---
ul.addEventListener('click', (e) => {
    const botao = e.target.closest('.remover');
    if (!botao) return;
    const id = botao.closest('.item').dataset.id;
    exercicios = exercicios.filter((ex) => ex.id !== id);
    desenhar();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!nomeLista.reportValidity()) return;
    if (exercicios.length === 0) {
        mostrarMsg('Adicione pelo menos um exercício à lista.', true);
        return;
    }

    const listas = lerListas();
    listas.push({
        id: novoId(),
        nome: nomeLista.value.trim(),
        exercicios,
        criadaEm: new Date().toISOString(),
    });
    localStorage.setItem(CHAVE, JSON.stringify(listas));

    exercicios = [];
    form.reset();
    desenhar();
    mostrarMsg('Lista salva.');
});

desenhar();
