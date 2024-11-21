// api/add-user.js
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const querystring = require("querystring");

// Conexão com o banco Neon
const sql = neon(process.env.DATABASE_URL);

module.exports = async (req, res) => {
  if (req.method === "GET") {
    // Exibe o formulário HTML para inserir um usuário
    const htmlForm = `
      <html>
        <head>
          <title>Adicionar Usuário</title>
        </head>
        <body>
          <h1>Adicionar Novo Usuário</h1>
          <form method="POST">
            <label for="nome">Nome:</label><br>
            <input type="text" id="nome" name="nome" required><br><br>
            
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email" required><br><br>

            <input type="submit" value="Adicionar Usuário">
          </form>
        </body>
      </html>
    `;
    res.status(200).send(htmlForm);
  } else if (req.method === "POST") {
    // Coleta os dados do formulário
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const { nome, email } = querystring.parse(body);

      try {
        // Verifica se o email já existe
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUser.length > 0) {
          // Modifica o email se já existir
          const emailWithNumber = email.replace('@', `+1@`);
          await sql`
            INSERT INTO users (nome, email)
            VALUES (${nome}, ${emailWithNumber})
            RETURNING id, nome, email
          `;
          res.status(200).send(`<h1>Usuário já existente, email alterado para ${emailWithNumber}</h1><a href='/add-user'>Voltar</a>`);
        } else {
          // Insere o novo usuário
          await sql`
            INSERT INTO users (nome, email)
            VALUES (${nome}, ${email})
            RETURNING id, nome, email
          `;
          res.status(200).send(`<h1>Usuário adicionado com sucesso!</h1><a href='/add-user'>Voltar</a>`);
        }
      } catch (error) {
        console.error("Erro ao adicionar o usuário:", error);
        res.status(500).send("<h1>Erro ao adicionar o usuário.</h1><a href='/add-user'>Voltar</a>");
      }
    });
  }
};
