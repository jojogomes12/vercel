// api/index.js
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

// Conexão com o banco Neon
const sql = neon(process.env.DATABASE_URL);

module.exports = async (req, res) => {
  try {
    // Consulta para obter todos os registros de usuários
    const result = await sql`
      SELECT id, nome, email FROM users
    `;

    if (result.length > 0) {
      // HTML para exibir os usuários de forma bonita em uma tabela
      let html = `
        <html>
          <head>
            <title>Lista de Usuários de dentro</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f9;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #4CAF50;
                color: white;
              }
              tr:hover {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Lista de Usuários</h1>
            <table>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
              </tr>`;

      // Preenchendo a tabela com os usuários
      result.forEach(user => {
        html += `
          <tr>
            <td>${user.id}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
          </tr>`;
      });

      html += `
            </table>
            <br>
            <a href="/add-user">Adicionar Novo Usuário</a>
          </body>
        </html>`;

      // Retorna a página HTML com a lista de usuários
      res.status(200).send(html);
    } else {
      // Caso não haja usuários, exibe mensagem alternativa
      res.status(200).send(`
        <html>
          <head>
            <title>Lista de Usuários</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f9;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              p {
                text-align: center;
                color: #555;
              }
            </style>
          </head>
          <body>
            <h1>Lista de Usuários</h1>
            <p>Nenhum usuário encontrado.</p>
            <br>
            <a href="/add-user">Adicionar Novo Usuário</a>
          </body>
        </html>
      `);
    }
  } catch (error) {
    res.status(500).send(`
      <html>
        <head>
          <title>Erro</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f9;
            }
            h1 {
              text-align: center;
              color: #d9534f;
            }
          </style>
        </head>
        <body>
          <h1>Erro ao listar os usuários</h1>
          <p>Houve um erro ao acessar o banco de dados. Tente novamente mais tarde.</p>
        </body>
      </html>
    `);
  }
};
