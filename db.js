const { Client } = require('pg');

// Configuração de conexão com o banco de dados Neon
const client = new Client({
    connectionString: 'postgresql://users_owner:UkrCn3GslL6X@ep-lucky-glade-a5c2lq8q-pooler.us-east-2.aws.neon.tech/users?sslmode=require',
});

client.connect();

// Testando a conexão com o banco de dados
client.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
    } else {
        console.log('Conexão bem-sucedida:', res.rows);
    }
});

// Exportando o client para uso em outros arquivos
module.exports = client;
