const form = document.getElementById('form-treino');
const erro = document.getElementById('erro');
const MSG_PADRAO = erro.textContent;

// Cada treino aponta para a sua página. Quando criar as outras, é só adicionar a linha.
// Ajuste "treinos" para o nome real da pasta que contém "Costas e biceps".
const PAGINAS = {
    'costas-biceps': '../treinos/Costas e biceps/index.html',
    'peito-triceps': '../treinos/Peito e triceps/index.html',
    'perna-panturrilha': '../treinos/Perna e panturrilha/index.html',
    'ombro-abdominal': '../treinos/Ombro e abdomem/index.html',
};
 
// Sugere o treino pelo dia da semana (seg=1 ... qui=4) e já deixa selecionado
const hoje = new Date().getDay();
const sugerido = document.querySelector(`.card[data-dia="${hoje}"]`);
if (sugerido) {
    sugerido.classList.add('sugerido');
    sugerido.querySelector('input').checked = true;
}
 
form.addEventListener('change', () => { erro.hidden = true; });
 
form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const escolhido = form.querySelector('input[name="treino"]:checked');
    if (!escolhido) {
        erro.textContent = MSG_PADRAO;
        erro.hidden = false;
        return;
    }
 
    // Por enquanto guarda a escolha; depois troque pelo redirecionamento
    // para a página do treino ou por uma chamada ao seu backend.
    localStorage.setItem('treinoEscolhido', escolhido.value);
    const destino = PAGINAS[escolhido.value];
    if (!destino) {
        erro.textContent = 'Esse treino ainda não está disponível.';
        erro.hidden = false;
        return;
    }
    window.location.href = destino;
});

// Guarda cada treino iniciado para o dashboard montar os gráficos
function registrarTreino(input) {
    let historico = [];
    try {
        historico = JSON.parse(localStorage.getItem('historicoTreinos')) ?? [];
    } catch {
        historico = [];
    }
    historico.push({
        treino: input.value,
        nome: input.closest('.card').querySelector('.card-titulo').textContent,
        data: new Date().toISOString(),
    });
    localStorage.setItem('historicoTreinos', JSON.stringify(historico));
}