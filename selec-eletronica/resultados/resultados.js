document.addEventListener('DOMContentLoaded', async () => {
    // Caminho para o JSON
    const DISCIPLINES_JSON = '../eletronica.json';
    let allDisciplines = {};
    let selectedUserDisciplines = JSON.parse(localStorage.getItem('selectedDisciplines')) || {};

    // Elementos DOM
    const backButton = document.getElementById('back-button');
    const disciplinesContainer = document.getElementById('disciplines-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Mostra indicador de carregamento
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    try {
        // Carrega o JSON de forma assíncrona
        const response = await fetch(DISCIPLINES_JSON);
        if (!response.ok) {
            throw new Error(`Erro ao carregar: ${response.status}`);
        }
        allDisciplines = await response.json();
        
        // Verifica se a estrutura está correta
        if (!allDisciplines || typeof allDisciplines !== 'object') {
            throw new Error('Estrutura de dados inválida');
        }
        
        console.log('Disciplinas carregadas com sucesso:', allDisciplines);
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        alert('Erro ao carregar as disciplinas. Verifique o console para detalhes.');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    // Função para verificar se TODOS os requisitos foram atendidos
    function areRequirementsMet(requirements) {
        if (!requirements || requirements.length === 0) {
            return true;
        }
        return requirements.every(req => selectedUserDisciplines[req] === true);
    }

    // Função para determinar as disciplinas disponíveis (com tratamento de erro)
    function getAvailableDisciplines() {
        const available = [];

        // Verifica se allDisciplines está carregado corretamente
        if (!allDisciplines || typeof allDisciplines !== 'object') {
            console.error('Dados de disciplinas não carregados corretamente');
            return available;
        }

        // Juntar todas as disciplinas
        const allDisciplinesList = [];
        for (const period in allDisciplines) {
            // Verifica se é um array válido
            if (Array.isArray(allDisciplines[period])) {
                allDisciplines[period].forEach(discipline => {
                    discipline.period = period;
                    allDisciplinesList.push(discipline);
                });
            }
        }

        // Filtra disciplinas disponíveis
        allDisciplinesList.forEach(discipline => {
            if (selectedUserDisciplines[discipline.value]) return;

            const preReqs = discipline.prerequisite || [];
            const coReqs = discipline.corequisite || [];

            if (areRequirementsMet(preReqs) && areRequirementsMet(coReqs)) {
                available.push(discipline);
            }
        });

        return available;
    }

    // Função para calcular a progressão (com tratamento de períodos inválidos)
    function calculateProgress() {
        let totalObligatory = 0;
        let completedObligatory = 0;

        for (let period = 1; period <= 10; period++) {
            const periodKey = period.toString();
            if (allDisciplines[periodKey] && Array.isArray(allDisciplines[periodKey])) {
                totalObligatory += allDisciplines[periodKey].length;
                allDisciplines[periodKey].forEach(discipline => {
                    if (selectedUserDisciplines[discipline.value]) {
                        completedObligatory++;
                    }
                });
            }
        }

        const percentage = totalObligatory > 0 
            ? Math.round((completedObligatory / totalObligatory) * 100)
            : 0;

        return { total: totalObligatory, completed: completedObligatory, percentage };
    }

    // Função para renderizar as disciplinas disponíveis
    function renderAvailableDisciplines(disciplines) {
        disciplinesContainer.innerHTML = '';

        if (!disciplines || disciplines.length === 0) {
            disciplinesContainer.innerHTML = `
                <p class="no-disciplines" style="
                    text-align: center; 
                    grid-column: 1 / -1; 
                    color: white;
                    padding: 20px;
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                ">
                    Não há disciplinas disponíveis.<br>
                    Você pode ter concluído todas ou precisar cumprir mais pré-requisitos.
                </p>
            `;
            return;
        }

        disciplines.forEach(discipline => {
            const card = document.createElement('div');
            card.className = 'discipline-card';
            
            let periodoDisplay = '';
            if (discipline.period === "OPTATIVAS") {
                periodoDisplay = "Optativa";
            } else if (discipline.period === "1") {
                periodoDisplay = "1º Período";
            } else {
                periodoDisplay = `${discipline.period}º Período`;
            }
            
            card.innerHTML = `
                <div class="discipline-name">${discipline.name}</div>
                <div class="discipline-info">Carga horária: ${discipline.carga_horaria}</div>
                <div class="discipline-info">${periodoDisplay}</div>
            `;
            disciplinesContainer.appendChild(card);
        });
    }

    // Função principal que processa as disciplinas
    function processDisciplines() {
        try {
            const availableDisciplines = getAvailableDisciplines();
            renderAvailableDisciplines(availableDisciplines);

            const progress = calculateProgress();
            progressFill.style.width = `${progress.percentage}%`;
            progressText.textContent = `${progress.percentage}%`;
        } catch (error) {
            console.error('Erro ao processar disciplinas:', error);
            disciplinesContainer.innerHTML = `
                <p class="error-message" style="
                    text-align: center;
                    color: #ff6b6b;
                    padding: 20px;
                ">
                    Ocorreu um erro ao carregar as disciplinas. Recarregue a página.
                </p>
            `;
        }
    }

    // Evento do botão voltar
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    // Inicia o processamento
    processDisciplines();
});