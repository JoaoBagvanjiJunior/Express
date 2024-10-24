const express = require('express')
const bcrypt = require('bcrypt')
const fs = require('fs')
const jwt = require("jsonwebtoken")
const router = express.Router()

const dadosLocais = JSON.parse(fs.readFileSync('dados.json'))


router.post('/LogIn', (req, res) =>{
    const  { email, senha } = req.body

    if (!email || !senha){
        res.status(433).send('Definir email e senha')
    }

    const user = dadosLocais.find((usuario) =>usuario.email === email)


    if (!user) {
        res.status(401).send('Email ou senha inválidos')
    }

    if (!bcrypt.compareSync(senha, user.hash)){
        res.status(401).send('Senha inválida')
    }

    res.status(200).send({
        email : user.email,
        nome : user.nome, 
        dados: user.dados,
        token: user.token,
    })

    
})

router.post('/criar', (req, res) =>{
    const { nome, email, senha } = req.body
    if (!email || !senha) {
        res.status(422).send('Precisa definir email e senha')
    } else if (dadosLocais.find((user) => user.nome === nome || user.email === email)) {
        res.status(401).send('Nome ou email ja em uso')
    } else {
        var dadosUsuario = {
            id : Math.floor(Math.random() * 9999999999),
            nome : nome,
            email : email,
            dados : {},
        }
        const token = jwt.sign({id: dadosUsuario.id}, "KEY_SECRETA")
        dadosUsuario.token = token
        const salt = bcrypt.genSaltSync()
        dadosUsuario.hash = bcrypt.hashSync(senha, salt)
        dadosLocais.push(dadosUsuario)
        const dadosConvertidos = JSON.stringify(dadosLocais, null, 2)
        fs.writeFileSync('dados.json', dadosConvertidos)
        res.status(200).send("ok")
    }
})

module.exports = router;