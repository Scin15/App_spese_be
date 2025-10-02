

import bcrypt from 'bcryptjs' // libreria per hash della password
import cookieParser from 'cookie-parser' // libreria per la getione dei cookie
import { PrismaClient } from '../generated/prisma/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
const prisma = new PrismaClient().$extends(withAccelerate())
const saltRounds = 10

// funzione per la creazione nuovo record
const insertExpense = async (req, res) => {
  const newExpense = req.body
  const currentDate = new Date().toJSON()
  console.log(`Inserimento nuova spesa: ${newExpense}`)

  console.log(
   {
      data: {
        userid : newExpense.userid,
        category_id : newExpense.category_id,
        date_create : currentDate,
        date_update : currentDate,
        amount: newExpense.amount,
        note : newExpense.note,
        date: new Date(newExpense.date).toJSON(),
        }
    } 
  )

  try{

    const expense = await prisma.expense.create({
      data: {
        userid : newExpense.userid,
        category_id : newExpense.category_id,
        date_create : currentDate,
        date_update : currentDate,
        amount: newExpense.amount,
        note : newExpense.note,
        date: new Date(newExpense.date).toJSON(),
        }
    })

    res.status(200).send(expense)
  } catch(error) {
    res.status(500).send(`Errore nell'insermnento nuova spesa: ${error}`)
  }
}

// funzione per la lettura di tutte le spese
const readExpense = async (req, res) => {
  try{
    const expense = await prisma.expense.findMany()
    res.status(200).send(expense)
  } catch(error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`)
  }  
}

// funzione per la lettura delle spese di un utente
const readUserExpense = async (req, res) => {
  try{
    console.log(req.params.id)
    const expense = await prisma.expense.findMany({
      where: {
        userid: {
          equals: Number(req.params.id)
        }
      },
      include: {
        category: {
          select: {
            category: true
          }
        }
      }
    })
    res.status(200).send(expense)
  } catch(error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`)
  }  
}

// funzione per la lettura delle categorie
const readCategory = async (req, res) => {
  try{
    const category = await prisma.category.findMany()
    res.status(200).send(category)
  } catch(error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`)
  }  
}

// funzione per l'update di una spesa
const updateExpense = async (req, res) => {
  const currentExpense = req.body
  const currentDate = new Date().toJSON()
  try{
    const expense = await prisma.expense.update({
      where : {
        id : currentExpense.id
      },
      data : {
        category_id : currentExpense.category_id,
        date_update : currentDate,
        amount : currentExpense.amount,
        note : currentExpense.note,
        date: new Date(currentExpense.date).toJSON()
      }
    })
    res.status(200).send(expense)
  } catch(error)
  {
    res.status(500).send(`Errore nell'update della spesa: ${error}`)
  }
}

// funzione per l'eliminazione di una spesa
const deleteExpense = async (req, res) => {
  const currentExpense = req.body
  try{
    const expense = await prisma.expense.delete({
      where : {
        id : currentExpense.id
      }
    })
    res.status(200).send(expense)
  } catch(error){
    res.status(500).send(`Errore nell'eliminazione della spesa : ${error}`)
  }
}

// funzione per l'eliminazione di una spesa
const deleteExpenseAll = async (req, res) => {
  try{
    const expense = await prisma.expense.deleteMany()
    res.status(200).send(expense)
  } catch(error){
    res.status(500).send(`Errore nell'eliminazione di tutte le spese : ${error}`)
  }
}

const readUserStats = async (req, res) => {
  try{
    // cerco il totale delle spes per l'utente
    const { _sum } = await prisma.expense.aggregate({
      _sum : {
        amount: true
      },
      where: {
        userid: {
          equals: Number(req.params.id)
        }
      }
    })

    // cerco la categoria in cui l'utente ha speso di più
    const maxCategory = await prisma.expense.groupBy({
      by: ["category_id"],
      where: {
        userid: {
          equals: Number(req.params.id)
        }
      },
      _sum : {
        amount: true
      },
    })

    maxCategory.sort((a ,b) => b._sum.amount - a._sum.amount)

    //cerco il budget dell'utente e calcolo la differenza rispetto a quello che ha speso in totale

    res.status(200).send({_sum, maxCategory: maxCategory[0]})

  } catch(error) {
    res.status(500).send(`Errore nella lettura delle statistiche utente: ${error}`)
  }
}

// export delle funzioni per CRUD API
export { 
  insertExpense, 
  readExpense, 
  readUserExpense,
  readCategory, 
  updateExpense, 
  deleteExpense, 
  deleteExpenseAll,
  readUserStats
}
