import { PrismaClient } from './generated/prisma/index.js'
import express from 'express'
import { insertExpense, readExpense, updateExpense, deleteExpense, deleteExpenseAll } from './controllers/app.controller.js'
import { registerUser, loginUser, logoutUser, protectedRoute, refreshToken } from './controllers/app.autentication.js'
import 'dotenv/config' // libreria dotenv per usare le variabili di ambiente con process.env.<variabile>
import cookieParser from 'cookie-parser' // libreria per la gestione di cookie
const app = express()

app.use(express.json())
app.use(cookieParser())

const prisma = new PrismaClient()

// registrazione utente
app.post('/register', registerUser)
// login utente
app.post('/login', loginUser)
// logour utente
app.post('/logout', logoutUser)
// percorso protetto da accesso
app.get('/protected', protectedRoute)
// refresh del token di accesso
app.post('/refresh_token', refreshToken)

// CRUD
app.get('/expenses', readExpense)
app.post('/expenses', insertExpense)
app.put('/expenses', updateExpense)
app.delete('/expenses', deleteExpense)
app.delete('/expenses/all', deleteExpenseAll)

// avvio server
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})

