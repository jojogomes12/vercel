require("dotenv").config();  // Carrega as variáveis de ambiente

const express = require("express");
const { neon } = require("@neondatabase/serverless");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Conexão com o banco Neon usando a URL do ambiente
const sql = neon(process.env.DATABASE_URL);

// Middleware para interpretar os dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para listar os usuários e renderizar uma página HTML
app.get("/", async (req, res) => {
  try {
    // Consulta para obter todos os registros de usuários
    const result = await sql`
      SELECT id, nome, email FROM users
    `;

    // HTML da página
    let htmlContent = `
      <html>
        <head>
          <title>Lista de  cadastros</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 80%; margin: 20px auto; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f4f4f4; }
            form { width: 80%; margin: 20px auto; }
            input[type="text"], input[type="email"] { padding: 10px; width: 100%; margin: 10px 0; }
            button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
            button:hover { background-color: #45a049; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Usuários Encontrados</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
            </tr>`;

    // Adiciona os usuários na tabela HTML
    result.forEach(user => {
      htmlContent += `
        <tr>
          <td>${user.id}</td>
          <td>${user.nome}</td>
          <td>${user.email}</td>
        </tr>`;
    });

    htmlContent += `
          </table>
          <h2 style="text-align: center;">Adicionar Novo Usuário</h2>
          <form action="/add-user" method="POST" style="text-align: center;">
            <input type="text" name="nome" placeholder="Nome" required />
            <input type="email" name="email" placeholder="Email" required />
            <button type="submit">Adicionar Usuário</button>
          </form>
        </body>
      </html>`;

    // Envia o conteúdo HTML para o navegador
    res.send(htmlContent);
  } catch (error) {
    console.error("Erro ao listar os usuários:", error);
    res.status(500).send("Erro ao listar os usuários.");
  }
});

// Rota para adicionar um novo usuário ao banco de dados
app.post("/add-user", async (req, res) => {
  try {
    const { nome, email } = req.body;

    // Verifica se o email já existe no banco
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      // Adiciona um número ao email para evitar duplicação
      const newEmail = email.replace(/@/, `+${Date.now()}@`);

      // Insere o novo usuário com o email modificado
      const result = await sql`
        INSERT INTO users (nome, email)
        VALUES (${nome}, ${newEmail})
        RETURNING id, nome, email
      `;

      res.send(`
        <h1>Usuário já existente com esse email. Novo email gerado: ${newEmail}</h1>
        <a href="/">Voltar</a>
      `);
    } else {
      // Insere o usuário com o email original
      const result = await sql`
        INSERT INTO users (nome, email)
        VALUES (${nome}, ${email})
        RETURNING id, nome, email
      `;

      res.send(`
        <h1>Usuário Adicionado com Sucesso!</h1>
        <a href="/">Voltar</a>
      `);
    }
  } catch (error) {
    console.error("Erro ao adicionar o usuário:", error);
    res.status(500).send("Erro ao adicionar o usuário.");
  }
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
