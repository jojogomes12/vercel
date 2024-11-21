require("dotenv").config();  // Carrega as variáveis de ambiente

const { neon } = require("@neondatabase/serverless");
const http = require("http");
const fs = require("fs");
const url = require("url");

// Conexão com o banco Neon usando a URL do ambiente
const sql = neon(process.env.DATABASE_URL);

// Função para servir a página HTML
const servePage = (page, res) => {
  fs.readFile(page, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao carregar a página.");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};

// Função para inserir dados de usuário
const insertUser = async (name, email, res) => {
  try {
    // Verifica se o email já existe, e se sim, adicione um número para garantir a unicidade
    let result = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (result.length > 0) {
      // Se o email já existir, adiciona um número antes do email
      const emailParts = email.split("@");
      email = `${emailParts[0]}1@${emailParts[1]}`; // Adicionando um número no final do email
    }

    // Insere o usuário no banco de dados
    await sql`
      INSERT INTO users (nome, email)
      VALUES (${name}, ${email})
    `;

    // Após a inserção, redireciona para a página inicial
    res.writeHead(302, {
      Location: "/"
    });
    res.end();

  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Erro ao inserir dados no banco.");
  }
};

// Função para tratar as requisições HTTP
const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Exibir a página inicial
  if (parsedUrl.pathname === "/") {
    servePage("index.html", res);
  }
  
  // Rota para a página de cadastro
  else if (parsedUrl.pathname === "/add-user" && req.method === "GET") {
    servePage("add-user.html", res);
  }

  // Inserir dados quando o formulário for enviado via POST
  else if (parsedUrl.pathname === "/add-user" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const parsedBody = new URLSearchParams(body);
      const name = parsedBody.get("name");
      const email = parsedBody.get("email");
      insertUser(name, email, res);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Página não encontrada.");
  }
};

// Criação do servidor HTTP
http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
