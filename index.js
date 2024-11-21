require("dotenv").config();  // Carrega as variáveis de ambiente

const express = require("express");
const { neon } = require("@neondatabase/serverless");

const app = express();
const port = 3000;

// Conexão com o banco Neon usando a URL do ambiente
const sql = neon(process.env.DATABASE_URL);

// Rota para listar os usuários e renderizar uma página HTML
app.get("/", async (req, res) => {
  try {
    // Consulta para obter todos os registros de usuários
    const result = await sql`
      SELECT id, nome, email FROM users
    `;

    // Caso tenha resultados, renderiza a página com os dados
    if (result.length > 0) {
      let htmlContent = `
        <html>
          <head>
            <title>Lista de Usuários</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 80%; margin: 20px auto; border-collapse: collapse; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f4f4f4; }
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
          </body>
        </html>`;

      // Envia o conteúdo HTML para o navegador
      res.send(htmlContent);
    } else {
      res.send("<h1 style='text-align: center;'>Nenhum usuário encontrado.</h1>");
    }
  } catch (error) {
    console.error("Erro ao listar os usuários:", error);
    res.status(500).send("Erro ao listar os usuários.");
  }
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
