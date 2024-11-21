require("dotenv").config();  // Carrega as variáveis de ambiente

const http = require("http");
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

// Conexão com o banco Neon usando a URL do ambiente
const sql = neon(process.env.DATABASE_URL);

// Função para listar todos os registros de usuários
const listUsers = async () => {
  try {
    // Consulta para obter todos os registros de usuários
    const result = await sql`
      SELECT id, nome, email FROM users
    `;

    // Se houver resultados, mostra-os
    if (result.length > 0) {
      console.log("Usuários encontrados:");
      result.forEach(user => {
        console.log(`ID: ${user.id}, Nome: ${user.nome}, Email: ${user.email}`);
      });
    } else {
      console.log("Nenhum usuário encontrado.");
    }
  } catch (error) {
    console.error("Erro ao listar os usuários:", error);
  }
};

// Função para renderizar o formulário de inserção
const renderAddUserForm = (res) => {
  const htmlForm = `
    <html>
      <head>
        <title>Adicionar Usuário</title>
      </head>
      <body>
        <h1>Adicionar Novo Usuário</h1>
        <form method="POST" action="/add-user">
          <label for="nome">Nome:</label><br>
          <input type="text" id="nome" name="nome" required><br><br>
          
          <label for="email">Email:</label><br>
          <input type="email" id="email" name="email" required><br><br>

          <input type="submit" value="Adicionar Usuário">
        </form>
      </body>
    </html>
  `;
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(htmlForm);
};

// Função para lidar com o envio do formulário
const handleAddUser = async (req, res) => {
  let body = '';
  
  // Coletar os dados do POST
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    const { nome, email } = querystring.parse(body);

    try {
      // Verificar se o email já existe
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        // Adiciona um número ao email caso já exista
        const emailWithNumber = email.replace('@', `+1@`);
        await sql`
          INSERT INTO users (nome, email)
          VALUES (${nome}, ${emailWithNumber})
          RETURNING id, nome, email
        `;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Usuário já existente, email alterado para ${emailWithNumber}</h1><a href="/">Voltar</a>`);
      } else {
        // Inserir os dados no banco
        await sql`
          INSERT INTO users (nome, email)
          VALUES (${nome}, ${email})
          RETURNING id, nome, email
        `;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Usuário adicionado com sucesso!</h1><a href="/">Voltar</a>`);
      }
    } catch (error) {
      console.error("Erro ao adicionar o usuário:", error);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>Erro ao adicionar o usuário.</h1><a href='/'>Voltar</a>");
    }
  });
};

// Função para lidar com as requisições
const requestHandler = (req, res) => {
  const pathname = url.parse(req.url).pathname;
  
  if (req.method === "GET" && pathname === "/") {
    // Página inicial com a lista de usuários
    listUsers().then(() => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Bem-vindo! Verifique o console para a lista de usuários.</h1>");
    });
  } else if (req.method === "GET" && pathname === "/add-user") {
    // Página para adicionar um usuário
    renderAddUserForm(res);
  } else if (req.method === "POST" && pathname === "/add-user") {
    // Processa o envio do formulário
    handleAddUser(req, res);
  } else {
    // Rota não encontrada
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>Rota não encontrada!</h1>");
  }
};

// Criação do servidor HTTP
http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
