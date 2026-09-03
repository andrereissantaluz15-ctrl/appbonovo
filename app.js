document.addEventListener('DOMContentLoaded', () => {
    // Define UI Elements
    const dataInput = document.getElementById('data');
    const skuInput = document.getElementById('sku');
    const loteInput = document.getElementById('lote');
    const quantidadeInput = document.getElementById('quantidade');
    const tipoOcorrenciaInput = document.getElementById('tipo-ocorrencia');
    const btnInserirItem = document.getElementById('btn-inserir-item');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    const editIdInput = document.getElementById('edit-id');
    const tabelaMateriais = document.getElementById('tabela-materiais');
    const listaMateriaisBody = document.getElementById('lista-materiais-body');
    const semItensMsg = document.getElementById('sem-itens');
    
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const btnCamera = document.getElementById('btn-camera');
    const btnGallery = document.getElementById('btn-gallery');
    const previewImages = document.getElementById('preview-images');
    const printImageSection = document.getElementById('print-image-section');
    
    const btnGerarPdf = document.getElementById('btn-gerar-pdf');

    // State
    let items = [];

    // --- INITIALIZATION ---
    
    // Set Current Date - PT-BR format
    const today = new Date();
    dataInput.value = today.toLocaleDateString('pt-BR');

    // Event Listeners
    btnInserirItem.addEventListener('click', handleInserirItem);
    btnCancelarEdicao.addEventListener('click', cancelarEdicao);

    // Nova Transportadora Logic
    const transportadoraSelect = document.getElementById('transportadora');
    const novaTransportadoraInput = document.getElementById('nova-transportadora');

    transportadoraSelect.addEventListener('change', function () {
        if (this.value === 'OUTRA') {
            novaTransportadoraInput.classList.remove('hidden');
            novaTransportadoraInput.focus();
        } else {
            novaTransportadoraInput.classList.add('hidden');
            novaTransportadoraInput.value = '';
        }
    });
    
    // Image Upload Handlers
    btnCamera.addEventListener('click', (e) => {
        e.preventDefault();
        cameraInput.click();
    });

    btnGallery.addEventListener('click', (e) => {
        e.preventDefault();
        galleryInput.click();
    });

    function processImageFiles(files) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                const imgData = event.target.result;

                const img = document.createElement('img');
                img.src = imgData;
                img.alt = 'Evidência da Ocorrência';
                img.style.width = '100%';
                img.style.maxHeight = '420px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '8px';
                img.style.background = '#fff';

                previewImages.appendChild(img);
                printImageSection.classList.remove('hidden');
            };

            reader.onerror = function() {
                alert('Erro ao ler uma das imagens. Tente novamente.');
            };

            reader.readAsDataURL(file);
        });

        btnCamera.style.borderColor = '#10ac84';
        btnCamera.style.backgroundColor = 'rgba(16, 172, 132, 0.05)';
        btnGallery.style.borderColor = '#10ac84';
        btnGallery.style.backgroundColor = 'rgba(16, 172, 132, 0.05)';
    }

    cameraInput.addEventListener('change', function (e) {
        processImageFiles(e.target.files);
        e.target.value = '';
    });

    galleryInput.addEventListener('change', function (e) {
        processImageFiles(e.target.files);
        e.target.value = '';
    });

    // --- CRUD MATERIAL ITEMS ---
    
    function handleInserirItem() {
        const sku = skuInput.value.trim();
        const lote = loteInput.value.trim();
        const quantidade = parseInt(quantidadeInput.value);
        const tipoOcorrencia = tipoOcorrenciaInput.value;

        if (!sku || !lote || !quantidade || !tipoOcorrencia) {
            alert('Por favor, preencha todos os campos do material (SKU, Lote, Quantidade e Tipo).');
            return;
        }

        const editId = editIdInput.value;

        if (editId) {
            // Edit existing item
            const index = items.findIndex(item => item.id === editId);
            if (index !== -1) {
                items[index] = {
                    id: editId,
                    sku,
                    lote,
                    quantidade,
                    tipoOcorrencia
                };
            }
            cancelarEdicao();
        } else {
            // Add new item
            const newItem = {
                id: Date.now().toString(),
                sku,
                lote,
                quantidade,
                tipoOcorrencia
            };
            items.push(newItem);
            
            // Clear inputs
            skuInput.value = '';
            loteInput.value = '';
            quantidadeInput.value = '';
            tipoOcorrenciaInput.value = '';
            skuInput.focus();
        }

        renderItems();
    }

    function renderItems() {
        listaMateriaisBody.innerHTML = '';
        
        if (items.length === 0) {
            tabelaMateriais.classList.add('hidden');
            semItensMsg.classList.remove('hidden');
            return;
        }

        tabelaMateriais.classList.remove('hidden');
        semItensMsg.classList.add('hidden');

        items.forEach(item => {
            const tr = document.createElement('tr');
            
            let badgeBg = '#e3f2fd';
            let badgeColor = '#1565c0';
            
            if(item.tipoOcorrencia === 'Avaria') {
                badgeBg = '#ffebee';
                badgeColor = '#c62828';
            } else if (item.tipoOcorrencia === 'Falta') {
                badgeBg = '#fff3e0';
                badgeColor = '#ef6c00';
            }

            tr.innerHTML = `
                <td><strong>${item.sku}</strong></td>
                <td>${item.lote}</td>
                <td>${item.quantidade}</td>
                <td><span style="padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; background:${badgeBg}; color:${badgeColor};">
                ${item.tipoOcorrencia}</span></td>
                <td class="actions-col no-print">
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editarItem('${item.id}')" title="Editar">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="removerItem('${item.id}')" title="Excluir">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            listaMateriaisBody.appendChild(tr);
        });
    }

    window.editarItem = function(id) {
        const item = items.find(i => i.id === id);
        if (item) {
            skuInput.value = item.sku;
            loteInput.value = item.lote;
            quantidadeInput.value = item.quantidade;
            tipoOcorrenciaInput.value = item.tipoOcorrencia;
            editIdInput.value = item.id;

            btnInserirItem.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar Alteração';
            btnCancelarEdicao.classList.remove('hidden');
            
            // Scroll to form smoothly
            skuInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    window.removerItem = function(id) {
        if(confirm('Tem certeza que deseja excluir este item?')) {
            items = items.filter(i => i.id !== id);
            renderItems();
        }
    };

    function cancelarEdicao() {
        skuInput.value = '';
        loteInput.value = '';
        quantidadeInput.value = '';
        tipoOcorrenciaInput.value = '';
        editIdInput.value = '';
        
        btnInserirItem.innerHTML = '<i class="ph ph-plus-circle"></i> Inserir Item';
        btnCancelarEdicao.classList.add('hidden');
    }

    // --- PDF GENERATION ---
    
    btnGerarPdf.addEventListener('click', () => {
        // Validações
        const transp = transportadoraSelect.value;
        const nf = document.getElementById('nf').value;
        
        if(!transp) {
            alert('Por favor, selecione a Transportadora antes de gerar o PDF.');
            transportadoraSelect.focus();
            return;
        }

        if(transp === 'OUTRA' && !novaTransportadoraInput.value.trim()) {
            alert('Por favor, informe o nome da nova transportadora.');
            novaTransportadoraInput.focus();
            return;
        }

        if(items.length === 0) {
            alert('Por favor, adicione ao menos um material para gerar o B.O.');
            skuInput.focus();
            return;
        }

        const delivery = document.getElementById('delivery').value.trim() || 'SemDelivery';
        const transpLabel = (transp === 'OUTRA') ? novaTransportadoraInput.value.trim() : transp;
        
        // Formatar nome do arquivo (remover caracteres especiais e espaços)
        const safeTransp = transpLabel.replace(/[^a-z0-9]/gi, '_');
        const safeDelivery = delivery.replace(/[^a-z0-9]/gi, '_');
        const safeNf = (nf || 'SemNF').replace(/[^a-z0-9]/gi, '_');

        document.body.classList.add('pdf-generation');
        
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        
        const element = document.getElementById('pdf-content');

        const opt = {
            margin:       0, 
            filename:     `BO_${safeTransp}_${safeDelivery}_${safeNf}_${dd}${mm}${yyyy}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const originalText = btnGerarPdf.innerHTML;
        btnGerarPdf.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Preparando Relatório...';
        btnGerarPdf.disabled = true;

        // Pequeno delay para garantir que a classe CSS .pdf-generation foi aplicada
        setTimeout(() => {
            html2pdf().set(opt).from(element).save().then(() => {
                document.body.classList.remove('pdf-generation');
                btnGerarPdf.innerHTML = originalText;
                btnGerarPdf.disabled = false;
            }).catch(err => {
                console.error('Erro ao gerar PDF:', err);
                document.body.classList.remove('pdf-generation');
                btnGerarPdf.innerHTML = originalText;
                btnGerarPdf.disabled = false;
                alert('Ocorreu um erro ao gerar o PDF.');
            });
        }, 800);

    });

    // Initial render
    renderItems();
});
