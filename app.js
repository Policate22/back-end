const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Adicionei bcryptjs para criptografar senha

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
    const { nome, email, senha, endereco, cidade, estado } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const sql = "INSERT INTO JJJ_usuario (nome, email, senha, endereco, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)";

    try {
        const [rows] = await connection.execute(sql, [nome, email, senhaCriptografada, endereco, cidade, estado]);
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
    const { campo1, campo2, campo3 } = req.body; // Ajuste os campos de acordo com sua tabela de registros
    const sql = "INSERT INTO JJJ_registros (campo1, campo2, campo3) VALUES (?, ?, ?)";

    try {
        const [rows] = await connection.execute(sql, [campo1, campo2, campo3]);
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
});
