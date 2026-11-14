const CHAVE_HISTORICO = 'historicoTreinos';
const ABAS = ['home', 'escolher', 'criar'];

const NOMES = {
    'costas-biceps': 'Costas e Bíceps',
    'peito-triceps': 'Peito e Tríceps',
    'perna-panturrilha': 'Perna e Panturrilha',
    'ombro-abdominal': 'Ombro e Abdominal',
};

// Edite aqui a descrição de cada treino (aparece em "Últimos treinos")
const DESCRICOES = {
    'costas-biceps': 'Puxada baixa, remada baixa, puxada alta, puxador triângulo e serrote, mais rosca W, rosca banco 45° e rosca na polia.',
    'peito-triceps': 'Treino focado em peito e tríceps.',
    'perna-panturrilha': 'Treino completo de perna, com panturrilha.',
    'ombro-abdominal': 'Treino focado em ombro e abdominal.',
};

const fmtDia = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtSemana = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/* ---------- Dados ---------- */
function lerHistorico() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) ?? [];
    } catch {
        return [];
    }
}

function salvarHistorico(lista) {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
}

function gerarExemplo() {
    const valores = Object.keys(NOMES);
    const exemplo = [];
    for (let i = 0; i < 56; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(18, 30, 0, 0);
        const dow = d.getDay();
        if (dow >= 1 && dow <= 4 && (i * 7) % 5 !== 0) {
            exemplo.push({ treino: valores[dow - 1], data: d.toISOString(), exemplo: true });
        }
    }
    salvarHistorico([...lerHistorico(), ...exemplo]);
}

/* ---------- Datas ---------- */
function inicioSemana(data) {
    const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // semana começa na segunda
    return d;
}

/* ---------- Helpers de DOM ---------- */
function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

/* ---------- Home ---------- */
function desenharHome() {
    const historico = lerHistorico().map((h) => ({ ...h, data: new Date(h.data) }));
    document.getElementById('vazio-home').hidden = historico.length > 0;
    document.getElementById('painel-home').hidden = historico.length === 0;
    if (historico.length === 0) return;

    const hoje = new Date();
    const semanaAtual = inicioSemana(hoje).getTime();

    // Estatísticas
    const naSemana = historico.filter((h) => inicioSemana(h.data).getTime() === semanaAtual).length;
    const noMes = historico.filter((h) => h.data.getMonth() === hoje.getMonth() && h.data.getFullYear() === hoje.getFullYear()).length;
    const contagem = {};
    historico.forEach((h) => { contagem[h.treino] = (contagem[h.treino] ?? 0) + 1; });
    const topo = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('est-semana').textContent = naSemana;
    document.getElementById('est-mes').textContent = noMes;
    document.getElementById('est-top').textContent = NOMES[topo[0]] ?? topo[0];

    desenharSemanas(historico, semanaAtual);
    desenharGrupos(contagem);
    desenharUltimos(historico);
    document.getElementById('btn-limpar').hidden = !historico.some((h) => h.exemplo);
}

function desenharSemanas(historico, semanaAtual) {
    const alvo = document.getElementById('grafico-semanas');
    alvo.replaceChildren();

    const semanas = [];
    for (let i = 7; i >= 0; i--) {
        const ini = new Date(semanaAtual);
        ini.setDate(ini.getDate() - 7 * i);
        const total = historico.filter((h) => inicioSemana(h.data).getTime() === ini.getTime()).length;
        semanas.push({ ini, total });
    }

    const maximo = Math.max(...semanas.map((s) => s.total), 1);
    semanas.forEach((s, i) => {
        const col = el('div', i === 7 ? 'coluna atual' : 'coluna');
        const barra = el('div', 'barra');
        barra.style.setProperty('--p', (s.total / maximo) * 100);
        col.append(el('span', 'valor', s.total), barra, el('span', 'rotulo', fmtSemana.format(s.ini)));
        alvo.append(col);
    });
    alvo.setAttribute('aria-label', 'Treinos por semana: ' + semanas.map((s) => `${fmtSemana.format(s.ini)}: ${s.total}`).join(', '));
}

function desenharGrupos(contagem) {
    const alvo = document.getElementById('grafico-grupos');
    alvo.replaceChildren();
    const maximo = Math.max(...Object.values(contagem), 1);

    Object.entries(NOMES).forEach(([valor, nome]) => {
        const total = contagem[valor] ?? 0;
        const linha = el('div', 'linha');
        const trilho = el('div', 'trilho');
        const preenche = el('div', 'preenche');
        preenche.style.setProperty('--p', (total / maximo) * 100);
        trilho.append(preenche);
        linha.append(el('span', '', nome), trilho, el('span', '', total));
        alvo.append(linha);
    });
    alvo.setAttribute('aria-label', 'Treinos por grupo: ' + Object.entries(NOMES).map(([v, n]) => `${n}: ${contagem[v] ?? 0}`).join(', '));
}

function desenharUltimos(historico) {
    const ul = document.getElementById('ultimos');
    ul.replaceChildren();

    [...historico].sort((a, b) => b.data - a.data).slice(0, 5).forEach((h) => {
        const li = el('li');
        const hora = el('time', '', fmtDia.format(h.data));
        hora.dateTime = h.data.toISOString();
        li.append(el('strong', '', NOMES[h.treino] ?? h.nome ?? h.treino), hora, el('p', '', DESCRICOES[h.treino] ?? ''));
        ul.append(li);
    });
}

document.getElementById('btn-exemplo').addEventListener('click', () => { gerarExemplo(); desenharHome(); });
document.getElementById('btn-limpar').addEventListener('click', () => {
    salvarHistorico(lerHistorico().filter((h) => !h.exemplo));
    desenharHome();
});

/* ---------- Abas (navegação pelo hash da URL) ---------- */
function mostrarAba() {
    const pedida = location.hash.slice(1);
    const nome = ABAS.includes(pedida) ? pedida : 'home';

    document.querySelectorAll('.aba').forEach((s) => { s.hidden = s.id !== nome; });
    document.querySelectorAll('.menu a').forEach((a) => {
        if (a.getAttribute('href') === '#' + nome) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });

    // O iframe só carrega na primeira vez que a aba é aberta
    const frame = document.querySelector(`#${nome} iframe`);
    if (frame && !frame.getAttribute('src')) frame.src = frame.dataset.src;

    if (nome === 'home') desenharHome();
}

window.addEventListener('hashchange', mostrarAba);
mostrarAba();
