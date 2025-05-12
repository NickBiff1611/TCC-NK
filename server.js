const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       
  password: 'BiffNick123@',       
  database: 'lava_rapido'
});


db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});


app.get('/horarios-ocupados', (req, res) => {
    const { data } = req.query;
    
    db.query(
        'SELECT horario FROM agendamentos WHERE data = ?',
        [data],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const horariosOcupados = results.map(r => r.horario.substring(0, 5));
            res.json(horariosOcupados);
        }
    );
});

app.post('/agendamentos', (req, res) => {
    const { cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario } = req.body;
    
    db.query(
        'INSERT INTO agendamentos (cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario) VALUES (?, ?, ?, ?, ?, ?)',
        [cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, message: 'Agendamento criado com sucesso!' });
        }
    );
});

app.get('/servicos', (req, res) => {
  db.query('SELECT * FROM servicos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


app.get('/funcionarios', (req, res) => {
  db.query('SELECT * FROM funcionarios', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/agendamentos', (req, res) => {
  const { email } = req.query;
  let query = 'SELECT a.*, s.nome as servico_nome FROM agendamentos a JOIN servicos s ON a.servico_id = s.id';
  
  if (email) {
    query += ' WHERE a.cliente_email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else {
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  }
});

app.post('/agendamentos', (req, res) => {
  const { cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario } = req.body;
  
  db.query(
    'INSERT INTO agendamentos (cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario) VALUES (?, ?, ?, ?, ?, ?)',
    [cliente_nome, cliente_email, cliente_telefone, servico_id, data, horario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Agendamento criado com sucesso!' });
    }
  );
});

app.post('/feedbacks', (req, res) => {
  const { nome, email, nota, comentario } = req.body;
  
  db.query(
    'INSERT INTO feedbacks (nome, email, nota, comentario) VALUES (?, ?, ?, ?)',
    [nome, email, nota, comentario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Feedback registrado com sucesso!' });
    }
  );
});

app.get('/horarios-disponiveis', (req, res) => {
  const { data } = req.query;
  
  db.query(
    'SELECT horario FROM agendamentos WHERE data = ?',
    [data],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const horariosOcupados = results.map(r => r.horario);
      
      const todosHorarios = [];
      for (let hora = 9; hora <= 18; hora++) {
        todosHorarios.push(`${hora}:00:00`);
      }
      
      const horariosDisponiveis = todosHorarios.filter(
        horario => !horariosOcupados.includes(horario)
      );
      
      res.json(horariosDisponiveis);
    }
  );
});


