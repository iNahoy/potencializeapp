document.addEventListener('DOMContentLoaded', function() {
    const botoes = document.querySelectorAll('.botao');
    botoes.forEach(function(botao) {
        if (botao.textContent.trim() === 'Engenharia Eletrônica') {
            botao.addEventListener('click', function() {
                window.location.href = 'selec-eletronica/index.html';
            });
        }
        else if (botao.textContent.trim() === 'Engenharia Elétrica') {
            botao.addEventListener('click', function(){
                window.location.href = 'selec-eletrica/index.html';
            });
        }
        else if (botao.textContent.trim() === 'Engenharia Civil'){
            botao.addEventListener('click', function(){
                window.location.href = 'selec-civil/index.html';
            });
        }
        else if (botao.textContent.trim() === 'Engenharia de Materiais'){
            botao.addEventListener('click', function(){
                window.location.href = 'selec-materiais/index.html'
            });
        }
        else if (botao.textContent.trim() === 'Engenharia Mecânica'){
            botao.addEventListener('click', function (){
                window.location.href = 'selec-mecanica/index.html'
            });
        };
    });
});