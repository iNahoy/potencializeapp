// script.js - CÓDIGO EXCLUSIVO PARA A PÁGINA DE PERÍODOS DE ENGENHARIA ELETRICA
document.addEventListener('DOMContentLoaded', () => {
    // Variável para armazenar as disciplinas carregadas do JSON.
    let allDisciplines = {};
    let currentPeriodDisplayed = null;

    // Caminho para o seu arquivo JSON de disciplinas.
    const DISCIPLINES_JSON_PATH = './eletrica.json';

    // Função para mostrar alerta personalizado
    function showCustomAlert(message) {
        const alertModal = document.createElement('div');
        alertModal.className = 'custom-alert';
        alertModal.innerHTML = `
            <div class="custom-alert-content">
                <p>${message}</p>
                <button class="custom-alert-button">OK</button>
            </div>
        `;
        document.body.appendChild(alertModal);
        
        // Fechar ao clicar no botão
        alertModal.querySelector('.custom-alert-button').addEventListener('click', () => {
            document.body.removeChild(alertModal);
        });
        
        // Fechar ao clicar fora
        alertModal.addEventListener('click', (e) => {
            if (e.target === alertModal) {
                document.body.removeChild(alertModal);
            }
        });
    }

    // Função assíncrona para carregar as disciplinas do arquivo JSON.
    async function loadDisciplines() {
        try {
            const response = await fetch(DISCIPLINES_JSON_PATH);
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status} ao carregar ${DISCIPLINES_JSON_PATH}`);
            }
            allDisciplines = await response.json();
            console.log('Disciplinas carregadas com sucesso:', allDisciplines);
        } catch (error) {
            console.error('Erro ao carregar as disciplinas:', error);
            showCustomAlert('Não foi possível carregar as disciplinas. Verifique o console para mais detalhes.');
        }
    }

    // Objeto para armazenar as disciplinas que o usuário selecionou.
    let selectedUserDisciplines = JSON.parse(localStorage.getItem('selectedDisciplines')) || {};
    console.log('Disciplinas selecionadas carregadas:', selectedUserDisciplines);

    // Carrega as disciplinas do JSON quando a página é carregada.
    loadDisciplines().then(() => {
        // Obtenção das referências de elementos HTML.
        const backButton = document.getElementById('back-button');
        const resultsButton = document.getElementById('results-button');
        const periodButtons = document.querySelectorAll('.botao-periodo');
        const disciplinesModal = document.getElementById('disciplines-modal');
        const closeButton = document.querySelector('.close-button');
        const modalTitle = document.getElementById('modal-title');
        const disciplinesList = document.querySelector('.disciplines-list');
        const saveButton = document.querySelector('.save-button');
        const selectAllButton = document.querySelector('.select-all-button');

        // --- Evento para a navegação de voltar ---
        backButton.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        resultsButton.addEventListener('click', () => {
            window.location.href = 'resultados/resultados.html';
        });
        
        // Função para verificar se TODOS os requisitos foram atendidos.
        function areRequirementsMet(requirements) {
            if (!requirements || requirements.length === 0) {
                return true;
            }
            return requirements.every(req => selectedUserDisciplines[req] === true);
        }

        // Função para buscar o OBJETO COMPLETO de uma disciplina pelo seu VALUE.
        function getDisciplineDataByValue(value) {
            for (const periodKey in allDisciplines) {
                const found = allDisciplines[periodKey].find(d => d.value === value);
                if (found) return found;
            }
            return null;
        }

        // Função para atualizar o estado dos checkboxes no modal
        function updateCheckboxStates() {
            const checkboxes = disciplinesList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const disciplineValue = checkbox.value;
                const labelElement = checkbox.parentElement;
                let warningElement = labelElement.querySelector('.prerequisite-warning');

                const currentDisciplineData = getDisciplineDataByValue(disciplineValue);

                if (!currentDisciplineData) {
                    checkbox.disabled = false;
                    labelElement.classList.remove('disabled-discipline');
                    checkbox.checked = selectedUserDisciplines[disciplineValue] || false;
                    if (warningElement) warningElement.style.display = 'none';
                    return;
                }

                const prerequisites = currentDisciplineData.prerequisite || [];
                const corequisites = currentDisciplineData.corequisite || [];

                const isPrereqSatisfied = areRequirementsMet(prerequisites);
                const isCoreqSatisfied = areRequirementsMet(corequisites);
                const isDisabled = !isPrereqSatisfied || !isCoreqSatisfied;

                if (!warningElement) {
                    warningElement = document.createElement('span');
                    warningElement.className = 'prerequisite-warning';
                    labelElement.appendChild(warningElement);
                }

                let missingMessages = [];

                if (isDisabled) {
                    checkbox.disabled = true;
                    checkbox.checked = false;
                    labelElement.classList.add('disabled-discipline');

                    if (!isPrereqSatisfied) {
                        const missingPrereqsValues = prerequisites.filter(p => !selectedUserDisciplines[p]);
                        if (missingPrereqsValues.length > 0) {
                            const missingNames = missingPrereqsValues.map(pVal => 
                                getDisciplineDataByValue(pVal)?.name || pVal);
                            missingMessages.push(`Trancado por: ${missingNames.join(' e ')}`);
                        }
                    }

                    if (!isCoreqSatisfied) {
                        const missingCoreqsValues = corequisites.filter(p => !selectedUserDisciplines[p]);
                        if (missingCoreqsValues.length > 0) {
                            const missingNames = missingCoreqsValues.map(pVal => 
                                getDisciplineDataByValue(pVal)?.name || pVal);
                            missingMessages.push(`Co-requisito: ${missingNames.join(' e ')}`);
                        }
                    }
                    
                    if (missingMessages.length > 0) {
                        warningElement.textContent = ` (${missingMessages.join('; ')})`;
                        warningElement.style.display = 'inline';
                    } else {
                        warningElement.style.display = 'none';
                    }
                } else {
                    checkbox.disabled = false;
                    labelElement.classList.remove('disabled-discipline');
                    checkbox.checked = selectedUserDisciplines[disciplineValue] || false;
                    warningElement.style.display = 'none';
                }
            });
        }

        // Função para preencher o modal com as disciplinas de um período específico.
        function populateDisciplinesModal(periodNumber) {
            disciplinesList.innerHTML = '';
            currentPeriodDisplayed = periodNumber;
            
            if (periodNumber === "OPTATIVAS") {
                modalTitle.textContent = "Disciplinas Optativas";
                selectAllButton.style.display = 'none';
            } else {
                modalTitle.textContent = `Disciplinas do ${periodNumber}º Período`;
                selectAllButton.style.display = 'block';
            }

            const disciplinesToDisplay = allDisciplines[periodNumber] || [];

            if (disciplinesToDisplay.length === 0) {
                disciplinesList.innerHTML = '<p style="text-align: center; color: gray;">Nenhuma disciplina cadastrada para este período.</p>';
                return;
            }

            disciplinesToDisplay.forEach(discipline => {
                const label = document.createElement('label');
                label.className = 'discipline-item';

                const prerequisites = discipline.prerequisite || [];
                const corequisites = discipline.corequisite || [];
                const isPrereqSatisfied = areRequirementsMet(prerequisites);
                const isCoreqSatisfied = areRequirementsMet(corequisites);
                const isDisabled = !isPrereqSatisfied || !isCoreqSatisfied;

                if (isDisabled) label.classList.add('disabled-discipline');

                let warningMessages = [];

                if (!isPrereqSatisfied) {
                    const missingPrereqsValues = prerequisites.filter(p => !selectedUserDisciplines[p]);
                    if (missingPrereqsValues.length > 0) {
                        const missingNames = missingPrereqsValues.map(pVal => 
                            getDisciplineDataByValue(pVal)?.name || pVal);
                        warningMessages.push(`Trancado por: ${missingNames.join(' e ')}`);
                    }
                }
                if (!isCoreqSatisfied) {
                    const missingCoreqsValues = corequisites.filter(p => !selectedUserDisciplines[p]);
                    if (missingCoreqsValues.length > 0) {
                        const missingNames = missingCoreqsValues.map(pVal => 
                            getDisciplineDataByValue(pVal)?.name || pVal);
                        warningMessages.push(`Co-requisito: ${missingNames.join(' e ')}`);
                    }
                }
                
                const warningSpanContent = warningMessages.length > 0 ? 
                    `<span class="prerequisite-warning">${warningMessages.join('; ')}</span>` : '';
                
                const isChecked = selectedUserDisciplines[discipline.value] === true;

                label.innerHTML = `
                    <input type="checkbox" value="${discipline.value}" 
                        ${isChecked && !isDisabled ? 'checked' : ''} 
                        ${isDisabled ? 'disabled' : ''}>
                    <div class="discipline-label">
                        <div class="discipline-name">
                            <span>${discipline.name} (${discipline.carga_horaria})</span>
                        </div>
                        ${warningSpanContent}
                    </div>
                `;
                disciplinesList.appendChild(label);
            });

            // Adiciona evento de 'change' aos checkboxes
            disciplinesList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', (event) => {
                    const changedDisciplineValue = event.target.value;
                    const isChecked = event.target.checked;

                    if (isChecked) {
                        selectedUserDisciplines[changedDisciplineValue] = true;
                    } else {
                        delete selectedUserDisciplines[changedDisciplineValue];
                        const disciplinesToUncheckQueue = [changedDisciplineValue];

                        let index = 0;
                        while (index < disciplinesToUncheckQueue.length) {
                            const currentUnchecked = disciplinesToUncheckQueue[index++];

                            for (const periodKey in allDisciplines) {
                                allDisciplines[periodKey].forEach(d => {
                                    const dependsOnCurrent = 
                                        (d.prerequisite && d.prerequisite.includes(currentUnchecked)) ||
                                        (d.corequisite && d.corequisite.includes(currentUnchecked));

                                    if (dependsOnCurrent && selectedUserDisciplines[d.value]) {
                                        delete selectedUserDisciplines[d.value];
                                        disciplinesToUncheckQueue.push(d.value);
                                    }
                                });
                            }
                        }
                    }
                    updateCheckboxStates();
                });
            });

            updateCheckboxStates();
        }

        // Adiciona evento de clique a todos os botões de período.
        periodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const period = button.dataset.periodo;
                populateDisciplinesModal(period);
                disciplinesModal.style.display = 'flex';
            });
        });

        // Evento para fechar o modal clicando no 'X'.
        closeButton.addEventListener('click', () => {
            disciplinesModal.style.display = 'none';
        });

        // Evento para fechar o modal clicando fora do conteúdo
        window.addEventListener('click', (event) => {
            if (event.target === disciplinesModal) {
                disciplinesModal.style.display = 'none';
            }
        });

        // Funcionalidade para o botão "Salvar Seleção".
        saveButton.addEventListener('click', () => {
            localStorage.setItem('selectedDisciplines', JSON.stringify(selectedUserDisciplines));
            console.log('Disciplinas Selecionadas Salvas:', selectedUserDisciplines);
            showCustomAlert('Disciplinas selecionadas salvas e atualizadas!');
            disciplinesModal.style.display = 'none';
        });

        // Funcionalidade para o botão "Selecionar Todas"
        selectAllButton.addEventListener('click', () => {
            if (!currentPeriodDisplayed || currentPeriodDisplayed === "OPTATIVAS") return;
            
            const disciplinesToSelect = allDisciplines[currentPeriodDisplayed] || [];
            let countSelected = 0;
            
            disciplinesToSelect.forEach(discipline => {
                // Verifica se os requisitos estão satisfeitos
                const prerequisites = discipline.prerequisite || [];
                const corequisites = discipline.corequisite || [];
                const isPrereqSatisfied = areRequirementsMet(prerequisites);
                const isCoreqSatisfied = areRequirementsMet(corequisites);
                
                if (isPrereqSatisfied && isCoreqSatisfied && !selectedUserDisciplines[discipline.value]) {
                    selectedUserDisciplines[discipline.value] = true;
                    countSelected++;
                }
            });
            
            // Atualiza os checkboxes e mostra feedback
            updateCheckboxStates();
            
            if (countSelected > 0) {
                showCustomAlert(`${countSelected} disciplina(s) do ${currentPeriodDisplayed}º período foram selecionadas!`);
            } else {
                showCustomAlert('Todas as disciplinas deste período já estavam selecionadas ou não atendem aos requisitos.');
            }
        });

    }).catch(error => {
        console.error("Falha ao inicializar a aplicação:", error);
        showCustomAlert("Erro crítico: Não foi possível carregar os dados das disciplinas.");
    });
});