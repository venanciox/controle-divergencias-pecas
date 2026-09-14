const API_URL = '/api/divergencias/';
const form = document.getElementById('divergencia-form');
const categoriaSelect = document.getElementById('categoria');
const divSubcategoria = document.getElementById('div-subcategoria');
const subcategoriaSelect = document.getElementById('subcategoria');
const tabelaBody = document.getElementById('tabela-body');
const emptyState = document.getElementById('empty-state');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');

const filtroSku = document.getElementById('filtro-sku');
const filtroCategoria = document.getElementById('filtro-categoria');

categoriaSelect.addEventListener('change', (e) => {
    if (e.target.value === 'Defeito') {
        divSubcategoria.classList.remove('hidden');
        subcategoriaSelect.setAttribute('required', 'required');
    } else {
        divSubcategoria.classList.add('hidden');
        subcategoriaSelect.removeAttribute('required');
        subcategoriaSelect.value = '';
    }
});

async function atualizarDashboard() {
    try {
        const response = await fetch('/api/estatisticas/');
        const stats = await response.json();
        document.getElementById('dash-total').textContent = stats.total;
        document.getElementById('dash-faltas').textContent = stats.faltas;
        document.getElementById('dash-sobras').textContent = stats.sobras;
        document.getElementById('dash-defeitos').textContent = stats.defeitos;
    } catch (error) { console.error("Erro no dashboard:", error); }
}

async function carregarDivergencias() {
    try {
        let url = API_URL + '?';
        if (filtroSku.value) url += `sku=${filtroSku.value.toUpperCase()}&`;
        if (filtroCategoria.value) url += `categoria=${filtroCategoria.value}`;

        const response = await fetch(url);
        const data = await response.json();
        
        tabelaBody.innerHTML = '';
        if (data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono uppercase">${item.sku}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantidade}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${item.categoria === 'Falta' ? 'bg-yellow-100 text-yellow-800' : 
                              item.categoria === 'Sobra' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'}">
                            ${item.categoria}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.subcategoria || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick='prepararEdicao(${JSON.stringify(item)})' class="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deletarDivergencia(${item.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });
        }
        atualizarDashboard();
    } catch (error) { console.error("Erro ao carregar dados:", error); }
}

filtroSku.addEventListener('input', carregarDivergencias);
filtroCategoria.addEventListener('change', carregarDivergencias);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('divergencia-id').value;
    const payload = {
        sku: document.getElementById('sku').value.toUpperCase(),
        quantidade: parseInt(document.getElementById('quantidade').value),
        categoria: categoriaSelect.value,
        subcategoria: subcategoriaSelect.value || null
    };

    try {
        const url = id ? `${API_URL}${id}` : API_URL;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            resetarFormulario();
            carregarDivergencias();
        }
    } catch (error) { console.error("Erro ao salvar:", error); }
});

window.prepararEdicao = function(item) {
    document.getElementById('divergencia-id').value = item.id;
    document.getElementById('sku').value = item.sku;
    document.getElementById('quantidade').value = item.quantidade;
    categoriaSelect.value = item.categoria;
    categoriaSelect.dispatchEvent(new Event('change'));
    if (item.subcategoria) subcategoriaSelect.value = item.subcategoria;
    
    formTitle.textContent = "Editar Divergência";
    btnCancelar.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletarDivergencia = async function(id) {
    if (confirm("Excluir este registro permanentemente?")) {
        await fetch(`${API_URL}${id}`, { method: 'DELETE' });
        carregarDivergencias();
    }
};

function resetarFormulario() {
    form.reset();
    document.getElementById('divergencia-id').value = '';
    categoriaSelect.dispatchEvent(new Event('change'));
    formTitle.textContent = "Registrar Nova Divergência";
    btnCancelar.classList.add('hidden');
}
btnCancelar.addEventListener('click', resetarFormulario);

carregarDivergencias();