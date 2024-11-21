const express = require('express');
const app = express();
const { Client } = require('./db');  // Importando a conexão com o banco Neon
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
