const headersPadrao = {
    'Content-Type': 'application/json'
};

const API_URL = '/api/divergencias/';
const form = document.getElementById('divergencia-form');
const categoriaSelect = document.getElementById('categoria');
const divSubcategoria = document.getElementById('div-subcategoria');
const subcategoriaSelect = document.getElementById('subcategoria');
const tabelaBody = document.getElementById('tabela-body');
const emptyState = document.getElementById('empty-state');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');
const divValor = document.getElementById('div-valor');
const inputValor = document.getElementById('valor_compra');
const filtroSku = document.getElementById('filtro-sku');
const filtroCategoria = document.getElementById('filtro-categoria');

function tratarErroAuth(response) {
    if (response.status === 401) {
        window.location.href = '/login.html';
        return true;
    }
    return false;
}

const subcategoriasPorCategoria = {
    'Falta': ['OS 17207', 'Estoque'],
    'Sobra': ['OS 17207', 'Estoque'],
    'Defeito': ['Avaria', 'Garantia', 'Fábrica'] 
};

categoriaSelect.addEventListener('change', (e) => {
    const categoria = e.target.value;
    const valorAtualSub = subcategoriaSelect.value;
    
    subcategoriaSelect.textContent = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.textContent = "Selecione...";
    subcategoriaSelect.appendChild(defaultOpt);
    
    if (categoria) {
        divSubcategoria.classList.remove('hidden');
        subcategoriaSelect.setAttribute('required', 'required');
        
        const opcoes = subcategoriasPorCategoria[categoria] || [];
        opcoes.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subcategoriaSelect.appendChild(opt);
        });

        if (opcoes.includes(valorAtualSub)) {
            subcategoriaSelect.value = valorAtualSub;
        }
        
        if (categoria === 'Defeito') {
            divValor.classList.remove('hidden');
        } else {
            divValor.classList.add('hidden');
            inputValor.value = '';
        }
    } else {
        divSubcategoria.classList.add('hidden');
        subcategoriaSelect.removeAttribute('required');
        divValor.classList.add('hidden');
        inputValor.value = '';
    }
});

async function atualizarDashboard() {
    try {
        const response = await fetch('/api/estatisticas/', { headers: headersPadrao, credentials: 'same-origin' });
        if (tratarErroAuth(response)) return;
        
        const stats = await response.json();
        document.getElementById('dash-total').textContent = stats.total;
        document.getElementById('dash-faltas').textContent = stats.faltas;
        document.getElementById('dash-sobras').textContent = stats.sobras;
        document.getElementById('dash-defeitos').textContent = stats.defeitos;
    } catch (error) { 
        console.error(error); 
    }
}

async function carregarDivergencias() {
    try {
        let url = API_URL + '?';
        if (filtroSku.value) url += `sku=${encodeURIComponent(filtroSku.value.toUpperCase())}&`;
        if (filtroCategoria.value) url += `categoria=${encodeURIComponent(filtroCategoria.value)}`;

        const response = await fetch(url, { headers: headersPadrao, credentials: 'same-origin' });
        if (tratarErroAuth(response)) return;

        const data = await response.json();
        
        tabelaBody.textContent = '';
        if (data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            data.forEach(item => {
                const tr = document.createElement('tr');

                const tdSku = document.createElement('td');
                tdSku.className = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono uppercase";
                tdSku.textContent = item.sku;
                tr.appendChild(tdSku);

                const tdQtd = document.createElement('td');
                tdQtd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
                tdQtd.textContent = item.quantidade;
                tr.appendChild(tdQtd);

                const tdCat = document.createElement('td');
                tdCat.className = "px-6 py-4 whitespace-nowrap text-sm";
                const spanCat = document.createElement('span');
                const cores = {
                    'Falta': 'bg-yellow-100 text-yellow-800',
                    'Sobra': 'bg-blue-100 text-blue-800',
                    'Defeito': 'bg-red-100 text-red-800'
                };
                spanCat.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cores[item.categoria] || ''}`;
                spanCat.textContent = item.categoria;
                tdCat.appendChild(spanCat);
                tr.appendChild(tdCat);

                const tdSub = document.createElement('td');
                tdSub.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
                tdSub.textContent = item.subcategoria || '-';
                tr.appendChild(tdSub);

                const tdVal = document.createElement('td');
                tdVal.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
                tdVal.textContent = item.valor_compra ? `R$ ${item.valor_compra.toFixed(2).replace('.', ',')}` : '-';
                tr.appendChild(tdVal);

                const tdAcoes = document.createElement('td');
                tdAcoes.className = "px-6 py-4 whitespace-nowrap text-right text-sm font-medium";
                
                const btnEdit = document.createElement('button');
                btnEdit.className = "text-indigo-600 hover:text-indigo-900 mr-3";
                btnEdit.title = "Editar";
                btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i>';
                btnEdit.onclick = () => prepararEdicao(item);
                tdAcoes.appendChild(btnEdit);

                const btnDel = document.createElement('button');
                btnDel.className = "text-red-600 hover:text-red-900";
                btnDel.title = "Excluir";
                btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
                btnDel.onclick = () => deletarDivergencia(item.id);
                tdAcoes.appendChild(btnDel);

                tr.appendChild(tdAcoes);
                tabelaBody.appendChild(tr);
            });
        }
        atualizarDashboard();
    } catch (error) { 
        console.error(error); 
    }
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
        subcategoria: subcategoriaSelect.value ? subcategoriaSelect.value.trim() : null,
        valor_compra: categoriaSelect.value === 'Defeito' && inputValor.value ? parseFloat(inputValor.value) : null
    };

    try {
        const url = id ? `${API_URL}${id}` : API_URL;
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: headersPadrao,
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });

        if (tratarErroAuth(response)) return;

        if (response.ok) {
            resetarFormulario();
            carregarDivergencias();
        } else {
            const erroServer = await response.json();
            alert("Erro: Verifique se os dados estão corretos.");
            console.error("Erro do servidor:", erroServer);
        }
    } catch (error) { 
        console.error(error); 
    }
});

window.prepararEdicao = function(item) {
    document.getElementById('divergencia-id').value = item.id;
    document.getElementById('sku').value = item.sku;
    document.getElementById('quantidade').value = item.quantidade;
    categoriaSelect.value = item.categoria;
    categoriaSelect.dispatchEvent(new Event('change'));

    if (item.subcategoria) {
        const opcaoExiste = Array.from(subcategoriaSelect.options).some(opt => opt.value === item.subcategoria);
        if (!opcaoExiste) {
            const opt = document.createElement('option');
            opt.value = item.subcategoria;
            opt.textContent = item.subcategoria + " (Registro Antigo)";
            subcategoriaSelect.appendChild(opt);
        }
        subcategoriaSelect.value = item.subcategoria;
    }

    if (item.valor_compra) {
        inputValor.value = item.valor_compra;
    } else {
        inputValor.value = '';
    }
    
    formTitle.textContent = "Editar Divergência";
    btnCancelar.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletarDivergencia = async function(id) {
    if (confirm("Excluir este registro permanentemente?")) {
        const response = await fetch(`${API_URL}${id}`, { 
            method: 'DELETE',
            headers: headersPadrao,
            credentials: 'same-origin'
        });
        if (tratarErroAuth(response)) return;
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

window.exportarExcelFiltrado = async function() {
    const categoriaSelecionada = document.getElementById('filtro-categoria').value;
    let url = '/api/exportar/excel';
    
    if (categoriaSelecionada) {
        url += `?categoria=${encodeURIComponent(categoriaSelecionada)}`;
    }
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        if (tratarErroAuth(response)) return;

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        let nomeArquivo = "relatorio_divergencias.xlsx";
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('filename=') !== -1) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
            if (matches != null && matches[1]) {
                nomeArquivo = matches[1].replace(/['"]/g, '');
            }
        }

        a.href = downloadUrl;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error(error);
    }
};

btnCancelar.addEventListener('click', resetarFormulario);
carregarDivergencias();