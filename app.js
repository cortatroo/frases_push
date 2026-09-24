// INSIRA SUA URL AQUI
const API_URL = "https://script.google.com/macros/s/AKfycbxN4mIt7Xk1ww-KyYA-J6Vir9M80ioxZLklkXlHdXH1M7ppHCCKigX4XnW05lN5aGdssw/exec"; 

let quotes = [];
let currentTab = 'Edição';
let currentView = 'frases';
let selectedTagFilter = null;
let editingQuoteId = null;

// Elementos DOM
const quoteList = document.getElementById('quoteList');
const tagList = document.getElementById('tagList');
const searchInput = document.getElementById('searchInput');
const searchContainer = document.getElementById('searchContainer');
const tabsContainer = document.getElementById('tabsContainer');
const activeTagBanner = document.getElementById('activeTagBanner');
const selectedTagName = document.getElementById('selectedTagName');
const btnClearTagFilter = document.getElementById('btnClearTagFilter');
const inputTag = document.getElementById('inputTag');
const suggestionsBox = document.getElementById('suggestionsBox');

const navFrases = document.getElementById('navFrases');
const navTags = document.getElementById('navTags');
const themeToggle = document.getElementById('themeToggle');
const modal = document.getElementById('addModal');
const modalTitle = document.getElementById('modalTitle');
const fabAdd = document.getElementById('fabAdd');

// --- TEMA ---
themeToggle.addEventListener('click', () => {
  if (document.body.getAttribute('data-theme') === 'dark') {
    document.body.removeAttribute('data-theme');
    themeToggle.innerHTML = '<span class="material-icons">dark_mode</span>';
  } else {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<span class="material-icons">light_mode</span>';
  }
});

// --- ABAS ---
document.getElementById('tabEdicao').addEventListener('click', (e) => switchTab('Edição', e.target));
document.getElementById('tabPostadas').addEventListener('click', (e) => switchTab('Postada', e.target));

function switchTab(tab, element) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderQuotes();
}

// --- NAV ---
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

// --- FILTRO TAG ---
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

// --- MODAL ---
fabAdd.addEventListener('click', () => openModalForAdd());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);

function openModalForAdd() {
  editingQuoteId = null;
  modalTitle.textContent = 'Cadastro frases';
  document.getElementById('inputAuthor').value = '';
  document.getElementById('inputQuote').value = '';
  inputTag.value = '';
  suggestionsBox.style.display = 'none';
  modal.style.display = 'block';
}

function openModalForEdit(quote) {
  editingQuoteId = quote.id;
  modalTitle.textContent = 'Editar Frase';
  document.getElementById('inputAuthor').value = quote.autor || '';
  document.getElementById('inputQuote').value = quote.frase || '';
  inputTag.value = quote.tag || '';
  suggestionsBox.style.display = 'none';
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
  editingQuoteId = null;
  suggestionsBox.style.display = 'none';
}

// --- LÓGICA DE SUGESTÕES DE TAG (NOVO E FUNCIONAL NO CELULAR) ---
function getUniqueTags() {
  const uniqueTags = new Set();
  quotes.forEach(q => {
    if (q.tag && q.tag.trim() !== '') {
      q.tag.split(',').forEach(t => {
        if (t.trim()) uniqueTags.add(t.trim());
      });
    }
  });
  return Array.from(uniqueTags);
}

inputTag.addEventListener('input', () => {
  const val = inputTag.value.toLowerCase().trim();
  suggestionsBox.innerHTML = '';
  
  if (!val) {
    suggestionsBox.style.display = 'none';
    return;
  }

  const allTags = getUniqueTags();
  const filteredTags = allTags.filter(t => t.toLowerCase().includes(val));

  if (filteredTags.length > 0) {
    filteredTags.forEach(tag => {
      const li = document.createElement('li');
      li.textContent = tag;
      li.onclick = () => {
        inputTag.value = tag;
        suggestionsBox.style.display = 'none';
      };
      suggestionsBox.appendChild(li);
    });
    suggestionsBox.style.display = 'block';
  } else {
    suggestionsBox.style.display = 'none';
  }
});

// Esconde as sugestões se clicar fora
document.addEventListener('click', (e) => {
  if (e.target !== inputTag && e.target !== suggestionsBox) {
    suggestionsBox.style.display = 'none';
  }
});

// --- BUSCA ---
searchInput.addEventListener('input', renderQuotes);

// --- CARREGAR DADOS ---
async function loadQuotes() {
  quoteList.innerHTML = '<div class="loading">Carregando frases...</div>';
  try {
    const response = await fetch(API_URL);
    quotes = await response.json();
    if (currentView === 'frases') renderQuotes(); else renderTagsView();
  } catch (error) {
    quoteList.innerHTML = '<div class="loading">Erro ao carregar dados.</div>';
  }
}

// --- RENDERIZAR FRASES (COMPACTAS) ---
function renderQuotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = quotes.filter(q => {
    const matchStatus = q.status === currentTab;
    const matchTagFilter = !selectedTagFilter || (q.tag && q.tag.toLowerCase() === selectedTagFilter.toLowerCase());
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

  [...filtered].reverse().forEach(q => {
    const card = document.createElement('div');
    card.className = 'quote-card';

    // Tratamento seguro de aspas usando escape nativo
    const fraseSafe = q.frase.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const autorSafe = (q.autor || 'Desconhecido').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');

    let actionsHtml = '';
    let checkboxHtml = '';

    if (currentTab === 'Edição') {
      checkboxHtml = `<input type="checkbox" onchange="markAsPosted('${q.id}')">`;
      actionsHtml = `
        <div class="card-actions-horizontal">
          <button class="action-btn btn-copy" onclick="copyQuote('${fraseSafe}', '${autorSafe}')"><span class="material-icons">content_copy</span></button>
          <button class="action-btn btn-edit" onclick="handleEditClick('${q.id}')"><span class="material-icons">edit</span></button>
          <button class="action-btn btn-delete" onclick="deleteQuote('${q.id}')"><span class="material-icons">delete</span></button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="card-actions-horizontal">
          <button class="action-btn btn-copy" onclick="copyQuote('${fraseSafe}', '${autorSafe}')"><span class="material-icons">content_copy</span></button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-top">
        <div class="quote-content">
          <blockquote><span class="material-icons quote-icon">format_quote</span>${q.frase}</blockquote>
          <div class="author">${q.autor ? q.autor : 'Desconhecido'}</div>
          ${q.tag ? `<span class="tag-chip" onclick="filterByTag('${q.tag}')">${q.tag}</span>` : ''}
        </div>
        <div>${checkboxHtml}</div>
      </div>
      ${actionsHtml}
    `;
    quoteList.appendChild(card);
  });
}

// --- RENDERIZAR TAGS ---
function renderTagsView() {
  const tagCounts = {};
  quotes.forEach(q => {
    if (q.tag && q.tag.trim() !== '') {
      q.tag.split(',').map(t => t.trim()).forEach(t => {
        if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
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

// --- SALVAR ---
document.getElementById('btnSave').addEventListener('click', async () => {
  const autor = document.getElementById('inputAuthor').value.trim();
  const frase = document.getElementById('inputQuote').value.trim();
  const tag = inputTag.value.trim();

  if (!frase) return alert("A frase é obrigatória!");

  const btnSave = document.getElementById('btnSave');
  btnSave.innerHTML = 'Salvando...';
  btnSave.disabled = true;

  const payload = { action: editingQuoteId ? 'update' : 'add', autor, frase, tag };
  if (editingQuoteId) payload.id = editingQuoteId;

  try {
    await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    closeModal();
    await loadQuotes();
  } catch (error) {
    alert("Erro ao salvar.");
  } finally {
    btnSave.innerHTML = '<span class="material-icons">save</span> SALVAR';
    btnSave.disabled = false;
  }
});

function handleEditClick(id) { const quote = quotes.find(q => q.id === id); if (quote) openModalForEdit(quote); }
async function markAsPosted(id) { if (confirm("Mover para Postadas?")) { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateStatus', id, status: 'Postada' }) }); loadQuotes(); } else renderQuotes(); }
async function deleteQuote(id) { if (confirm("Excluir esta frase?")) { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'delete', id }) }); loadQuotes(); } }

window.copyQuote = function(frase, autor) {
  navigator.clipboard.writeText(`"${frase}"\n- ${autor}`).then(() => {
    const toast = document.getElementById("toast");
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 2500);
  });
};

loadQuotes();
