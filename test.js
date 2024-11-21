require("dotenv").config();  // Carrega as variáveis de ambiente

const http = require("http");
const { neon } = require("@neondatabase/serverless");

// Conexão com o banco Neon usando a URL do ambiente
const sql = neon(process.env.DATABASE_URL);

// Função para tratar as requisições HTTP
const requestHandler = async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Teste simples de conexão (consulta a versão do PostgreSQL)
    try {
      const result = await sql`SELECT version()`;
      const { version } = result[0];
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Conexão bem-sucedida! Versão do PostgreSQL: ${version}`);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao conectar ao banco de dados.");
    }
  } else if (req.method === "GET" && req.url === "/insert-manual") {
    // Inserção manual de dados (nome e email)
    try {
      const name = "João";
      let email = "joao@example.com";

      // Verifica se o email já existe no banco
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        // Se o email já existir, adiciona um número ao final
        let counter = 1;
        let newEmail = `${name}${counter}@example.com`;
        
        // Verifica se o novo email também existe e continua incrementando o número
        while (true) {
          const emailExists = await sql`
            SELECT id FROM users WHERE email = ${newEmail}
          `;
          
          if (emailExists.length === 0) {
            email = newEmail;
            break;
          }

          counter++;
          newEmail = `${name}${counter}@example.com`;
        }
      }

      // Inserir dados no banco com o email modificado, se necessário
      const result = await sql`
        INSERT INTO users (nome, email)
        VALUES (${name}, ${email})
        RETURNING id, nome, email
      `;
      
      const insertedUser = result[0];

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        message: "Dados inseridos com sucesso!",
        user: insertedUser
      }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao inserir dados no banco.");
    }
  } else {
    // Rota não encontrada
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Rota não encontrada");
  }
};

// Criação do servidor HTTP
http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");

  // Inserir dados manualmente no banco quando o servidor iniciar
  const insertData = async () => {
    try {
      const name = "Mariana";
      let email = "mariana@example.com";
      
      // Verifica se o email já existe no banco
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        // Se o email já existir, adiciona um número ao final
        let counter = 1;
        let newEmail = `${name}${counter}@example.com`;
        
        // Verifica se o novo email também existe e continua incrementando o número
        while (true) {
          const emailExists = await sql`
            SELECT id FROM users WHERE email = ${newEmail}
          `;
          
          if (emailExists.length === 0) {
            email = newEmail;
            break;
          }

          counter++;
          newEmail = `${name}${counter}@example.com`;
        }
      }

      // Inserir dados no banco com o email modificado, se necessário
      const result = await sql`
        INSERT INTO users (nome, email)
        VALUES (${name}, ${email})
        RETURNING id, nome, email
      `;
      
      const insertedUser = result[0];
      console.log("Usuário inserido com sucesso:", insertedUser);
    } catch (error) {
      console.error("Erro ao inserir dados:", error);
    }
  };

  // Chama a função para inserir os dados manualmente
  insertData();
});
