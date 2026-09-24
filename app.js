const API_URL = "https://script.google.com/macros/s/AKfycbxN4mIt7Xk1ww-KyYA-J6Vir9M80ioxZLklkXlHdXH1M7ppHCCKigX4XnW05lN5aGdssw/exec"; 

let quotes = [];
let currentTab = 'Edição'; // 'Edição' ou 'Postada'
let currentView = 'frases'; // 'frases' ou 'tags'
let selectedTagFilter = null;
let editingQuoteId = null; // null para novo cadastro, ID para edição

// Elementos da DOM
const quoteList = document.getElementById('quoteList');
const tagList = document.getElementById('tagList');
const searchInput = document.getElementById('searchInput');
const searchContainer = document.getElementById('searchContainer');
const tabsContainer = document.getElementById('tabsContainer');
const activeTagBanner = document.getElementById('activeTagBanner');
const selectedTagName = document.getElementById('selectedTagName');
const btnClearTagFilter = document.getElementById('btnClearTagFilter');

const navFrases = document.getElementById('navFrases');
const navTags = document.getElementById('navTags');

const themeToggle = document.getElementById('themeToggle');
const modal = document.getElementById('addModal');
const modalTitle = document.getElementById('modalTitle');
const fabAdd = document.getElementById('fabAdd');

// --- TEMA (DARK MODE) ---
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

// --- ALTERNÂNCIA DE ABAS (EDIÇÃO / POSTADAS) ---
document.getElementById('tabEdicao').addEventListener('click', (e) => switchTab('Edição', e.target));
document.getElementById('tabPostadas').addEventListener('click', (e) => switchTab('Postada', e.target));

function switchTab(tab, element) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderQuotes();
}

// --- NAVEGAÇÃO INFERIOR (FRASES / TAGS) ---
navFrases.addEventListener('click', () => switchView('frases'));
navTags.addEventListener('click', () => switchView('tags'));

function switchView(view) {
  currentView = view;
  if (view === 'frases') {
    navFrases.classList.add('active');
    navTags.classList.remove('active');
    searchContainer.style.display = 'block';
    tabsContainer.style.display = 'flex';
    quoteList.style.display = 'block';
    tagList.style.display = 'none';
    fabAdd.style.display = 'flex';
    renderQuotes();
  } else {
    navTags.classList.add('active');
    navFrases.classList.remove('active');
    searchContainer.style.display = 'none';
    tabsContainer.style.display = 'none';
    quoteList.style.display = 'none';
    tagList.style.display = 'block';
    fabAdd.style.display = 'none';
    renderTagsView();
  }
}

// --- GERENCIAMENTO DE FILTRO DE TAG ---
function filterByTag(tagName) {
  selectedTagFilter = tagName;
  selectedTagName.textContent = tagName;
  activeTagBanner.style.display = 'flex';
  switchView('frases');
}

btnClearTagFilter.addEventListener('click', () => {
  selectedTagFilter = null;
  activeTagBanner.style.display = 'none';
  renderQuotes();
});

// --- MODAL (ABRIR, FECHAR, MODO ADICIONAR E EDITAR) ---
fabAdd.addEventListener('click', () => openModalForAdd());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);

function openModalForAdd() {
  editingQuoteId = null;
  modalTitle.textContent = 'Cadastro frases';
  document.getElementById('inputAuthor').value = '';
  document.getElementById('inputQuote').value = '';
  document.getElementById('inputTag').value = '';
  modal.style.display = 'block';
}

function openModalForEdit(quote) {
  editingQuoteId = quote.id;
  modalTitle.textContent = 'Editar Frase';
  document.getElementById('inputAuthor').value = quote.autor || '';
  document.getElementById('inputQuote').value = quote.frase || '';
  document.getElementById('inputTag').value = quote.tag || '';
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
  editingQuoteId = null;
}

// --- BUSCA EM TEMPO REAL ---
searchInput.addEventListener('input', () => {
  renderQuotes();
});

// --- CARREGAR DADOS DO GOOGLE SHEETS ---
async function loadQuotes() {
  quoteList.innerHTML = '<div class="loading">Carregando frases...</div>';
  try {
    const response = await fetch(API_URL);
    quotes = await response.json();
    if (currentView === 'frases') {
      renderQuotes();
    } else {
      renderTagsView();
    }
  } catch (error) {
    console.error("Erro ao carregar frases:", error);
    quoteList.innerHTML = '<div class="loading">Erro ao carregar dados. Verifique a URL e a conexão.</div>';
  }
}

// --- RENDERIZAR FRASES ---
function renderQuotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = quotes.filter(q => {
    // Filtro por Aba (Edição ou Postada)
    const matchStatus = q.status === currentTab;

    // Filtro por Tag Selecionada (se houver)
    const matchTagFilter = !selectedTagFilter || (q.tag && q.tag.toLowerCase() === selectedTagFilter.toLowerCase());

    // Filtro por Texto da Busca (Frase, Autor ou Tag)
    const matchSearch = !searchTerm || 
      (q.frase && q.frase.toLowerCase().includes(searchTerm)) || 
      (q.autor && q.autor.toLowerCase().includes(searchTerm)) || 
      (q.tag && q.tag.toLowerCase().includes(searchTerm));

    return matchStatus && matchTagFilter && matchSearch;
  });

  quoteList.innerHTML = '';

  if (filtered.length === 0) {
    quoteList.innerHTML = '<div class="loading">Nenhuma frase encontrada.</div>';
    return;
  }

  // Exibe as mais recentes primeiro
  [...filtered].reverse().forEach(q => {
    const card = document.createElement('div');
    card.className = 'quote-card';

    let actionsHtml = '';
    if (currentTab === 'Edição') {
      actionsHtml = `
        <input type="checkbox" title="Marcar como postada" onchange="markAsPosted('${q.id}')">
        <button class="edit-btn" title="Editar" onclick="handleEditClick('${q.id}')"><span class="material-icons">edit</span></button>
        <button class="delete-btn" title="Excluir" onclick="deleteQuote('${q.id}')"><span class="material-icons">delete</span></button>
      `;
    }

    card.innerHTML = `
      <div class="quote-content">
        <blockquote><span class="material-icons" style="font-size:0.9rem; color:#888;">format_quote</span> ${q.frase}</blockquote>
        <div class="author">${q.autor ? q.autor : 'Autor opcional'}</div>
        ${q.tag ? `<span class="tag-chip" onclick="filterByTag('${q.tag}')">${q.tag}</span>` : ''}
      </div>
      <div class="card-actions">
        ${actionsHtml}
      </div>
    `;
    quoteList.appendChild(card);
  });
}

// --- RENDERIZAR GERENCIADOR DE TAGS ---
function renderTagsView() {
  const tagCounts = {};

  quotes.forEach(q => {
    if (q.tag && q.tag.trim() !== '') {
      const tagsArray = q.tag.split(',').map(t => t.trim());
      tagsArray.forEach(t => {
        if (t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    }
  });

  const uniqueTags = Object.keys(tagCounts);

  tagList.innerHTML = '';

  if (uniqueTags.length === 0) {
    tagList.innerHTML = '<div class="loading">Nenhuma TAG cadastrada ainda.</div>';
    return;
  }

  const title = document.createElement('h3');
  title.className = 'tag-section-title';
  title.textContent = 'Gerenciador de TAGs (Livros / Estilos)';
  tagList.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'tag-grid';

  uniqueTags.forEach(tag => {
    const card = document.createElement('div');
    card.className = 'tag-card';
    card.onclick = () => filterByTag(tag);
    card.innerHTML = `
      <div class="tag-name">${tag}</div>
      <div class="tag-count">${tagCounts[tag]} frase(s)</div>
    `;
    grid.appendChild(card);
  });

  tagList.appendChild(grid);
}

// --- HANDLER PARA CLIQUE EM EDITAR ---
function handleEditClick(id) {
  const quote = quotes.find(q => q.id === id);
  if (quote) {
    openModalForEdit(quote);
  }
}

// --- SALVAR (ADICIONAR OU ATUALIZAR) ---
document.getElementById('btnSave').addEventListener('click', async () => {
  const autor = document.getElementById('inputAuthor').value.trim();
  const frase = document.getElementById('inputQuote').value.trim();
  const tag = document.getElementById('inputTag').value.trim();

  if (!frase) return alert("A frase é obrigatória!");

  const btnSave = document.getElementById('btnSave');
  btnSave.innerHTML = 'Salvando...';
  btnSave.disabled = true;

  const action = editingQuoteId ? 'update' : 'add';
  const payload = { action, autor, frase, tag };
  if (editingQuoteId) {
    payload.id = editingQuoteId;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    closeModal();
    await loadQuotes();
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar no Google Sheets.");
  } finally {
    btnSave.innerHTML = '<span class="material-icons">save</span> SAVE';
    btnSave.disabled = false;
  }
});

// --- MARCAR COMO POSTADA ---
async function markAsPosted(id) {
  if (confirm("Deseja mover esta frase para a aba Postadas?")) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'updateStatus', id: id, status: 'Postada' })
      });
      await loadQuotes();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status.");
    }
  } else {
    renderQuotes();
  }
}

// --- EXCLUIR FRASE ---
async function deleteQuote(id) {
  if (confirm("Tem certeza que deseja excluir esta frase?")) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'delete', id: id })
      });
      await loadQuotes();
    } catch (error) {
      console.error("Erro ao excluir frase:", error);
      alert("Erro ao excluir frase.");
    }
  }
}

// Inicializar aplicativo
loadQuotes();
