const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Adicionei bcryptjs para criptografar senha

const app = express();
app.use(cors('*'));
app.use(express.json());
app.listen(8443, () => console.log('Servidor Online'));

const connection = mysql.createPool({
    host: '10.111.4.30',
    user: 'dev1b',
    database: 'dev1b',
    password: 'Sen4i2024'
});

// Rota para teste de banco de dados
app.get('/statusbd', async (req, res) => {
    const [rows] = await connection.execute('select now()');
    res.json({
        msg: rows
    });
});

// CRUD - Read
app.get('/usuario/listar', async (req, res) => {
    const sql = 'select * from JJJ_usuario;';
    const [rows] = await connection.execute(sql);
    res.json({
        usuarios: rows
    });
});

// CRUD - Create (Cadastrando usuário)
app.post('/usuario/cadastrar', async (req, res) => {
    const { nome, senha, tipo_usuario, data_cadastro } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const sql = "INSERT INTO JJJ_usuario (nome, senha, tipo_usuario, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)";

    try {
        const [rows] = await connection.execute(sql, [nome, senhaCriptografada,tipo_usuario,data_cadastro]);
        res.json({
            msg: "Usuário cadastrado com sucesso!",
            usuario: rows
        });
    } catch (err) {
        res.status(500).json({
            msg: "Erro ao cadastrar usuário",
            error: err.message
        });
    }
});

// CRUD - Delete (Excluir usuário)
app.delete('/usuario/excluir/:id', async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM JJJ_usuario WHERE id = ?";

    try {
        const [result] = await connection.execute(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({
                msg: "Usuário excluído com sucesso!"
            });
        } else {
            res.status(404).json({
                msg: "Usuário não encontrado"
            });
        }
    } catch (err) {
        res.status(500).json({
            msg: "Erro ao excluir usuário",
            error: err.message
        });
    }
});

// CRUD - Read (Listar registros)
app.get('/registros/listar', async (req, res) => {
    const sql = 'SELECT * FROM JJJ_registros';
    try {
        const [rows] = await connection.execute(sql);
        res.json({ registros: rows });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao listar registros', error: err.message });
    }
});

// CRUD - Create (Adicionar registro)
app.post('/registro/adicionar', async (req, res) => {
    const { longitude, latitude, endereco, caminhoFoto, data_registro,status } = req.body; // Ajuste os campos de acordo com sua tabela de registros
    const sql = "INSERT INTO JJJ_registros (longitude, latitude, endereco, caminhoFoto, data_registro,status) VALUES (?, ?, ?)";

    try {
        const [rows] = await connection.execute(sql, [longitude, latitude, endereco, caminhoFoto, data_registro,status]);
        res.json({
            msg: "Registro adicionado com sucesso!",
            registro: rows
        });
    } catch (err) {
        res.status(500).json({
            msg: "Erro ao adicionar registro",
            error: err.message
        });
    }
});

// CRUD - Delete (Excluir registro)
app.delete('/registro/excluir/:id', async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM JJJ_registros WHERE id = ?";

    try {
        const [result] = await connection.execute(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({
                msg: "Registro excluído com sucesso!"
            });
        } else {
            res.status(404).json({
                msg: "Registro não encontrado"
            });
        }
    } catch (err) {
        res.status(500).json({
            msg: "Erro ao excluir registro",
            error: err.message
        });
    }
})
 
// Rota de Login
app.post('/usuario/login', async (req, res) => {
  const { nome, senha } = req.body;
  const sql = "SELECT * FROM JJJ_usuario WHERE usuario = ?";

  try {
      const [rows] = await connection.execute(sql, [nome]);
      
      if (rows.length === 0) {
          return res.status(401).json({ msg: "Usuário não encontrado" });
      }
      
      const usuario = rows[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaValida) {
          return res.status(401).json({ msg: "Senha incorreta" });
      }
      
      res.json({ msg: "Login bem-sucedido", usuario: { id:  usuario.nome, } });
  } catch (err) {
      res.status(500).json({ msg: "Erro ao realizar login", error: err.message });
      
  }
});

// Editar usuário
app.put('/usuario/editar/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, senha, tipo_usuario, data_cadastro } = req.body;
  let sql = "UPDATE JJJ_usuario SET nome = ?, senha = ?, tipo_usuario = ?, data_cadastro = ?  WHERE id = ?";
  let values = [nome, senha, tipo_usuario, data_cadastro, id];
  
  if (senha) {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      sql = "UPDATE JJJ_usuario SET nome = ?, email = ?, senha = ?, tipo_usuario = ?, data_cadastro =  ? WHERE id = ?";
      values = [nome, senhaCriptografada, tipo_usuario, data_cadastro, id];
  }

  try {
      const [result] = await connection.execute(sql, values);
      if (result.affectedRows > 0) {
          res.json({ msg: "Usuário atualizado com sucesso!" });
      } else {
          res.status(404).json({ msg: "Usuário não encontrado" });
      }
  } catch (err) {
      res.status(500).json({ msg: "Erro ao editar usuário", error: err.message });
  }
});

// Editar registro
app.put('/registro/editar/:id', async (req, res) => {
  const { id } = req.params;
  const { longitude, latitude, endereco, caminhoFoto, data_registro,status } = req.body;
  const sql = "UPDATE JJJ_registros SET longitude = ?, latitude = ?, endereco = ?, caminhoFoto = ?, data_registro = ?, status = ? WHERE id = ?";

  try {
      const [result] = await connection.execute(sql, [longitude, latitude, endereco, caminhoFoto, data_registro,status, id]);
      if (result.affectedRows > 0) {
          res.json({ msg: "Registro atualizado com sucesso!" });
      } else {
          res.status(404).json({ msg: "Registro não encontrado" });
      }
  } catch (err) {
      res.status(500).json({ msg: "Erro ao editar registro", error: err.message });
  }
});

