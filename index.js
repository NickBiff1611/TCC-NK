const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',        
  password: '',        
  database: 'lavajato' 
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida!');
});

module.exports = connection;

fetch('http://localhost:3000/servicos')
  .then(response => response.json())
  .then(data => console.log(data));


  async function carregarHorariosDisponiveis(dataSelecionada) {
    const horarioSelect = document.getElementById('horario');
    
    try {
        horarioSelect.innerHTML = '<option value="">Carregando horários...</option>';
        horarioSelect.disabled = true;

        const response = await fetch(`http://localhost:3000/horarios-ocupados?data=${dataSelecionada}`);
        const horariosOcupados = await response.json();

        const todosHorarios = ['09:00', '10:00', '11:00', '12:00', 
                             '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        const horariosDisponiveis = todosHorarios.filter(
            horario => !horariosOcupados.includes(horario)
        );

        horarioSelect.innerHTML = horariosDisponiveis.length > 0 
            ? horariosDisponiveis.map(horario => `
                <option value="${horario}">${horario}</option>
            `).join('')
            : '<option value="">Nenhum horário disponível</option>';
            
        horarioSelect.disabled = false;

    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        horarioSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
        horarioSelect.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', function() {

    const dataInput = document.getElementById('data');
    if (dataInput) {
        dataInput.addEventListener('change', function() {
            if (this.value) {
                carregarHorariosDisponiveis(this.value);
            } else {
                const horarioSelect = document.getElementById('horario');
                horarioSelect.innerHTML = '<option value="">Primeiro selecione uma data</option>';
                horarioSelect.disabled = true;
            }
        });
    }

    const formAgendamento = document.getElementById('formAgendamento');
    if (formAgendamento) {
        formAgendamento.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                cliente_nome: this.nome.value,
                cliente_email: this.email.value,
                cliente_telefone: this.telefone.value,
                servico_id: this.servico.value,
                data: this.data.value,
                horario: this.horario.value
            };

            try {
                const response = await fetch('http://localhost:3000/agendamentos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                const mensagem = document.getElementById('mensagem');
                
                mensagem.innerHTML = `
                    <p>Agendamento realizado com sucesso!</p>
                    <p>Número do agendamento: ${data.id}</p>
                `;
                mensagem.className = 'mensagem sucesso';
                this.reset();

            } catch (error) {
                document.getElementById('mensagem').innerHTML = `
                    <p>Erro ao realizar agendamento: ${error.message}</p>
                `;
                document.getElementById('mensagem').className = 'mensagem erro';
            }
        });
    }
});

  document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('listaServicos')) {
    fetch('http://localhost:3000/servicos')
      .then(response => response.json())
      .then(servicos => {
        const listaServicos = document.getElementById('listaServicos');
        listaServicos.innerHTML = servicos.map(servico => `
          <div class="servico-card">
            <h3>${servico.nome}</h3>
            <p>${servico.descricao}</p>
            <p class="preco">R$ ${servico.preco.toFixed(2)}</p>
            <p>Duração: ${servico.duracao} minutos</p>
          </div>
        `).join('');
      });
  }

  if (document.getElementById('listaFuncionarios')) {
    fetch('http://localhost:3000/funcionarios')
      .then(response => response.json())
      .then(funcionarios => {
        const listaFuncionarios = document.getElementById('listaFuncionarios');
        listaFuncionarios.innerHTML = funcionarios.map(funcionario => `
          <div class="funcionario-card">
            <img src="images/${funcionario.foto || 'default.jpg'}" alt="${funcionario.nome}">
            <h3>${funcionario.nome}</h3>
            <p class="cargo">${funcionario.cargo}</p>
            <p>${funcionario.bio}</p>
          </div>
        `).join('');
      });
  }

  if (document.getElementById('servico')) {
    fetch('http://localhost:3000/servicos')
      .then(response => response.json())
      .then(servicos => {
        const select = document.getElementById('servico');
        select.innerHTML = `
          <option value="">Selecione um serviço...</option>
          ${servicos.map(servico => `
            <option value="${servico.id}">${servico.nome} - R$ ${servico.preco.toFixed(2)}</option>
          `).join('')}
        `;
      });
  }

  if (document.getElementById('data')) {
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    
    dataInput.addEventListener('change', function() {
      if (this.value) {
        fetch(`http://localhost:3000/horarios-disponiveis?data=${this.value}`)
          .then(response => response.json())
          .then(horarios => {
            horarioSelect.innerHTML = horarios.length > 0 
              ? horarios.map(horario => `
                  <option value="${horario}">${horario.split(':')[0]}h</option>
                `).join('')
              : '<option value="">Nenhum horário disponível nesta data</option>';
            horarioSelect.disabled = false;
          });
      } else {
        horarioSelect.innerHTML = '<option value="">Primeiro selecione uma data</option>';
        horarioSelect.disabled = true;
      }
    });
  }

  if (document.getElementById('formAgendamento')) {
    document.getElementById('formAgendamento').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        cliente_nome: document.getElementById('nome').value,
        cliente_email: document.getElementById('email').value,
        cliente_telefone: document.getElementById('telefone').value,
        servico_id: document.getElementById('servico').value,
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value
      };
      
      fetch('http://localhost:3000/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        const mensagem = document.getElementById('mensagem');
        mensagem.innerHTML = `
          <p>Agendamento realizado com sucesso!</p>
          <p>Número do agendamento: ${data.id}</p>
        `;
        mensagem.className = 'mensagem sucesso';
        this.reset();
      })
      .catch(error => {
        document.getElementById('mensagem').innerHTML = `
          <p>Erro ao realizar agendamento: ${error.message}</p>
        `;
        document.getElementById('mensagem').className = 'mensagem erro';
      });
    });
  }

  if (document.getElementById('formConsulta')) {
    document.getElementById('formConsulta').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('emailConsulta').value;
      
      fetch(`http://localhost:3000/agendamentos?email=${email}`)
        .then(response => response.json())
        .then(agendamentos => {
          const resultado = document.getElementById('resultadoConsulta');
          
          if (agendamentos.length > 0) {
            resultado.innerHTML = agendamentos.map(agendamento => `
              <div class="agendamento-card">
                <h3>Agendamento #${agendamento.id}</h3>
                <p class="info"><strong>Serviço:</strong> ${agendamento.servico_nome}</p>
                <p class="info"><strong>Data:</strong> ${new Date(agendamento.data).toLocaleDateString('pt-BR')}</p>
                <p class="info"><strong>Horário:</strong> ${agendamento.horario.split(':')[0]}h</p>
                <p class="info"><strong>Status:</strong> ${agendamento.status}</p>
                <button class="btn btn-cancelar" data-id="${agendamento.id}">Cancelar Agendamento</button>
              </div>
            `).join('');
          } else {
            resultado.innerHTML = '<p>Nenhum agendamento encontrado para este e-mail.</p>';
          }
        });
    });
  }

  if (document.getElementById('formFeedback')) {
    document.getElementById('formFeedback').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        nome: document.getElementById('nomeFeedback').value,
        email: document.getElementById('emailFeedback').value,
        nota: document.getElementById('notaFeedback').value,
        comentario: document.getElementById('comentarioFeedback').value
      };
      
      fetch('http://localhost:3000/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(() => {
        alert('Obrigado pelo seu feedback!');
        this.reset();
      })
      .catch(error => {
        alert('Erro ao enviar feedback: ' + error.message);
      });
    });
  }
});

function carregarServicos() {
    fetch('http://localhost:3000/servicos')
        .then(response => response.json())
        .then(servicos => {
            const listaServicos = document.getElementById('listaServicos');
            
            listaServicos.innerHTML = servicos.map(servico => `
                <div class="servico-card">
                    <h3>${servico.nome}</h3>
                    <div class="servico-detalhes">
                        <p><strong>Descrição:</strong> ${servico.descricao}</p>
                        <p><strong>Preço:</strong> R$ ${servico.preco.toFixed(2)}</p>
                        <p><strong>Duração:</strong> ${servico.duracao} minutos</p>
                        <p><strong>Categoria:</strong> ${servico.categoria}</p>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar serviços:', error);
            document.getElementById('listaServicos').innerHTML = `
                <div class="mensagem-erro">
                    Não foi possível carregar os serviços. Tente novamente mais tarde.
                </div>
            `;
        });
}

function carregarServicos() {
    fetch('http://localhost:3000/servicos')
        .then(response => response.json())
        .then(servicos => {
            const listaServicos = document.getElementById('listaServicos');
            
            if (listaServicos) {
                listaServicos.innerHTML = servicos.map(servico => `
                    <div class="servico-card">
                        <h3>${servico.nome}</h3>
                        <div class="servico-detalhes">
                            <p><strong>Descrição:</strong> ${servico.descricao}</p>
                            <p><strong>Preço:</strong> R$ ${servico.preco.toFixed(2)}</p>
                            <p><strong>Duração:</strong> ${servico.duracao} minutos</p>
                        </div>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar serviços:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('listaServicos')) {
        carregarServicos();
    }

    if (document.getElementById('servico')) {
        fetch('http://localhost:3000/servicos')
            .then(response => response.json())
            .then(servicos => {
                const select = document.getElementById('servico');
                select.innerHTML = `
                    <option value="">Selecione um serviço...</option>
                    ${servicos.map(servico => `
                        <option value="${servico.id}">${servico.nome} - R$ ${servico.preco.toFixed(2)}</option>
                    `).join('')}
                `;
            });
    }

});

document.addEventListener('DOMContentLoaded', function() {
    const dataInput = document.getElementById('data');
    const verHorariosBtn = document.getElementById('verHorarios');
    const containerHorarios = document.getElementById('containerHorarios');
    let horarioSelecionado = null;

    if (dataInput && verHorariosBtn) {
        dataInput.addEventListener('change', function() {
            verHorariosBtn.disabled = !this.value;
        });
    }

    if (verHorariosBtn) {
        verHorariosBtn.addEventListener('click', async function() {
            const dataSelecionada = dataInput.value;
            
            try {
                const response = await fetch(`http://localhost:3000/horarios-ocupados?data=${dataSelecionada}`);
                const horariosOcupados = await response.json();
                
                const todosHorarios = ['09:00', '10:00', '11:00', '12:00', 
                                    '13:00', '14:00', '15:00', '16:00', '17:00'];
                
                containerHorarios.innerHTML = todosHorarios.map(horario => `
                    <button type="button" 
                            class="btn-horario ${horariosOcupados.includes(horario) ? 'ocupado' : ''}"
                            ${horariosOcupados.includes(horario) ? 'disabled' : ''}
                            data-horario="${horario}">
                        ${horario}
                    </button>
                `).join('');

                document.querySelectorAll('.btn-horario:not(.ocupado)').forEach(btn => {
                    btn.addEventListener('click', function() {
                        if (horarioSelecionado) {
                            horarioSelecionado.classList.remove('selecionado');
                        }
                        this.classList.add('selecionado');
                        horarioSelecionado = this;
                        document.getElementById('horario').value = this.dataset.horario;
                    });
                });

            } catch (error) {
                containerHorarios.innerHTML = `<p class="mensagem erro">Erro ao carregar horários</p>`;
            }
        });
    }

    const formAgendamento = document.getElementById('formAgendamento');
    if (formAgendamento) {
        formAgendamento.innerHTML += '<input type="hidden" id="horario" name="horario" required>';
    }
});




document.addEventListener('DOMContentLoaded', function() {
    const servicos = [
        { id: 1, nome: "Lavagem Simples", preco: 30.00, duracao: 30 },
        { id: 2, nome: "Lavagem Completa", preco: 60.00, duracao: 60 },
        { id: 3, nome: "Polimento Profissional", preco: 120.00, duracao: 120 },
        { id: 4, nome: "Higienização Interna", preco: 80.00, duracao: 90 },
        { id: 5, nome: "Lavagem de Motor", preco: 50.00, duracao: 40 },
        { id: 6, nome: "Cristalização de Pintura", preco: 200.00, duracao: 180 },
        { id: 7, nome: "Lavagem Ecológica", preco: 40.00, duracao: 25 },
        { id: 8, nome: "Higienização de Ar-Condicionado", preco: 60.00, duracao: 30 },
        { id: 9, nome: "Impermeabilização de Bancos", preco: 70.00, duracao: 60 },
        { id: 10, nome: "Pacote Premium", preco: 150.00, duracao: 150 }
    ];

    const tabela = document.querySelector('.tabela-servicos tbody');
    if (tabela) {
        tabela.innerHTML = servicos.map(servico => `
            <tr>
                <td>${servico.nome}</td>
                <td>R$ ${servico.preco.toFixed(2)}</td>
                <td>${servico.duracao} minutos</td>
            </tr>
        `).join('');
    }
});





document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Alternar entre formulários
    document.querySelectorAll('.auth-switch a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
            registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Validação de formulário
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4444';
                } else {
                    input.style.borderColor = '#444';
                }
            });

            if (isValid) {
                alert(form.id === 'loginForm' ? 'Login realizado!' : 'Cadastro concluído!');
                form.reset();
            }
        });
    });
});







document.querySelectorAll('.btn-voltar').forEach(botao => {
      botao.addEventListener('click', (e) => {
        e.preventDefault();
    
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
    
        document.getElementById('welcomeSection').style.display = 'block';
      });
    });