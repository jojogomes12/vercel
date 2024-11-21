const express = require('express');
const app = express();
const { Client } = require('./db');  // Importando a conexão com o banco Neon
const port = 3000;

// Middleware para interpretar JSON (caso precise enviar dados JSON)
app.use(express.json());

// Rota padrão
app.get('/', (req, res) => {
    res.send('Hello from Node.js!');
});

// Rota para testar a conexão com o banco Neon
app.get('/test-db', async (req, res) => {
    try {
        const result = await Client.query('SELECT NOW()');
        res.send(`Conexão com o banco bem-sucedida: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send('Erro ao conectar ao banco de dados');
    }
});

// Rota para inserir dados no banco Neon
app.post('/insert-data', async (req, res) => {
    const { name, email } = req.body;  // Obtendo dados do corpo da requisição

    if (!name || !email) {
        return res.status(400).send('Nome e email são obrigatórios.');
    }

    try {
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
        const values = [name, email];

        const result = await Client.query(query, values);
        res.status(200).send(`Dados inseridos: ${JSON.stringify(result.rows[0])}`);
    } catch (err) {
        res.status(500).send('Erro ao inserir dados no banco de dados');
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
