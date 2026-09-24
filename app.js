// ATENÇÃO: Cole aqui a URL gerada pelo Google Apps Script (Etapa 1)
const API_URL = "https://script.google.com/macros/s/AKfycbw3e2lZcogpvH-slCVd0Q30DlIEE2KpzmeKpfNoZPQvFQr-6-jsmug2KysRV6086vb_uQ/exec"; 

let quotes = [];
let currentTab = 'Edição';

const quoteList = document.getElementById('quoteList');
const searchInput = document.getElementById('searchInput');

// Theme Toggle (Modo Dark)
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.body.removeAttribute('data-theme');
    themeToggle.innerHTML = '<span class="material-icons">dark_mode</span>';
  } else {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<span class="material-icons">light_mode</span>';
  }
});

// Abas
document.getElementById('tabEdicao').addEventListener('click', (e) => switchTab('Edição', e.target));
document.getElementById('tabPostadas').addEventListener('click', (e) => switchTab('Postada', e.target));

function switchTab(tab, element) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderQuotes();
}

// Modal Control
const modal = document.getElementById('addModal');
document.getElementById('fabAdd').addEventListener('click', () => { modal.style.display = 'block'; });
document.getElementById('closeModal').addEventListener('click', () => { modal.style.display = 'none'; });
document.getElementById('btnCancel').addEventListener('click', () => { modal.style.display = 'none'; });

// Carregar Dados do Google Sheets
async function loadQuotes() {
  quoteList.innerHTML = '<div class="loading">Carregando frases...</div>';
  try {
    const response = await fetch(API_URL);
    quotes = await response.json();
    renderQuotes();
  } catch (error) {
    quoteList.innerHTML = '<div class="loading">Erro ao carregar dados.</div>';
  }
}

// Renderizar lista na tela
function renderQuotes() {
  const searchTerm = searchInput.value.toLowerCase();
  
  // Filtra por aba (Edição ou Postada) e pela busca (frase, autor ou tag)
  const filtered = quotes.filter(q => {
    const matchStatus = q.status === currentTab;
    const matchSearch = q.frase.toLowerCase().includes(searchTerm) || 
                        q.autor.toLowerCase().includes(searchTerm) || 
                        q.tag.toLowerCase().includes(searchTerm);
    return matchStatus && matchSearch;
  });

  quoteList.innerHTML = '';
  if (filtered.length === 0) {
    quoteList.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px;">Nenhuma frase encontrada.</div>';
    return;
  }

  filtered.reverse().forEach(q => {
    const div = document.createElement('div');
    div.className = 'quote-card';
    
    // Checkbox para postar e Botão excluir (só aparecem na Edição)
    let actions = '';
    if (currentTab === 'Edição') {
      actions = `
        <input type="checkbox" onchange="postQuote('${q.id}')" title="Marcar como postada">
        <button class="delete-btn" onclick="deleteQuote('${q.id}')"><span class="material-icons">delete</span></button>
      `;
    }

    div.innerHTML = `
      <div class="quote-text">
        <blockquote><span class="material-icons" style="font-size:1rem; color:#888">format_quote</span> ${q.frase}</blockquote>
        <div class="author">${q.autor || 'Desconhecido'}</div>
        ${q.tag ? `<div class="tag-chip">${q.tag}</div>` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
        ${actions}
      </div>
    `;
    quoteList.appendChild(div);
  });
}

// Salvar nova frase
document.getElementById('btnSave').addEventListener('click', async () => {
  const autor = document.getElementById('inputAuthor').value;
  const frase = document.getElementById('inputQuote').value;
  const tag = document.getElementById('inputTag').value;

  if (!frase) return alert("A frase é obrigatória!");

  const btnSave = document.getElementById('btnSave');
  btnSave.innerHTML = 'Salvando...';
  btnSave.disabled = true; // Desabilita o botão para evitar cliques duplos

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      // O Content-Type text/plain evita bloqueios de CORS preflight no Google Scripts
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({ action: 'add', autor, frase, tag })
    });

    // Se a requisição for bem sucedida
    document.getElementById('inputAuthor').value = '';
    document.getElementById('inputQuote').value = '';
    document.getElementById('inputTag').value = '';
    modal.style.display = 'none';
    
    loadQuotes(); // Recarrega a lista
    
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar. Verifique se a URL do Apps Script está correta no app.js e se a API foi implantada corretamente.");
  } finally {
    // Independente de dar erro ou sucesso, o botão volta ao normal
    btnSave.innerHTML = '<span class="material-icons">save</span> SAVE';
    btnSave.disabled = false;
  }
});

// Mover de Edição para Postada
async function postQuote(id) {
  if (confirm("Marcar esta frase como Postada?")) {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateStatus', id: id, status: 'Postada' })
    });
    loadQuotes();
  }
}

// Excluir Frase
async function deleteQuote(id) {
  if (confirm("Tem certeza que deseja excluir esta frase?")) {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id: id })
    });
    loadQuotes();
  }
}

// Busca dinâmica
searchInput.addEventListener('input', renderQuotes);

// Inicializa o app
loadQuotes();
