import 'dotenv/config' 
import { hash, compare } from 'bcryptjs' // libreria per la codifica hash delle password
import { PrismaClient } from '../generated/prisma/index.js'
import {
    generateAccessToken,
    generateRefreshToken,
    sendAccessToken,
    sendRefreshToken
} from './token.js'
import { isAuth } from './isAuth.js'

const prisma = new PrismaClient() 

const registerUser = async (req, res) => {
    const mail = req.body.mail
    const name = req.body.name
    const surname = req.body.surname
    const password = req.body.password
    const role = req.body.role

    if ( !mail || !name || !surname || !password ) { 
        throw ("Mancano dati")
    }

    // constrollo se l'utente è già presente nel DB
    const alreadyRegistered = await prisma.app_users.findFirst({
        where : {
            mail : mail
        }
    })
    // se già presenete nel DB lancio un errore
    if ( alreadyRegistered ) {
        throw ("Utente già registrato")
    }
    
    // se non presente nel DB codifico la password e aggiungo l'utente
    const hashedPassword = await hash( password, 10)
    const currentDate = new Date().toJSON()
    const insertUser = await prisma.app_users.create({
        data : {
            mail: mail,
            name : name,
            surname : surname,
            password : hashedPassword,
            role : role,
            date_create : currentDate
        }
    })

    res.status(200).send(insertUser)
}

const loginUser = async (req, res) => {

    try {
    // nel body viene passata mail e password
    const mail = req.body.mail
    const password = req.body.password

    if ( !mail || !password ) {
        throw ("Mail o password mancanti")
    }
    const user = await prisma.app_users.findFirst({
        where : {
            mail : mail
        }
    })
    if ( !user ) {
        throw ("Utente non registrato")
    }

    const userVerificated = await compare( password, user.password )
    if ( !userVerificated ) {
        throw("Password errata")
    }

    // creazione ed invio jwtoken (JSON Web token)
    const accessToken = generateAccessToken( user.id )
    const refreshToken = generateRefreshToken( user.id )
    // inserimento refresh_token nel DB
    const addRefreshToken = await prisma.app_users.update( {
        where : {
            id : user.id
        },
        data : {
            refresh_token: refreshToken
        }
    } )

    // invio del token di autenticazione e di refresh
    sendAccessToken( req, res, accessToken )
    sendRefreshToken( req, res, refreshToken)

    //res.status(200).send("Login effettuato")

    } catch(error) {
        res.status(500).send(`Errore durante l'autenticazione: ${ error }`)
    }
}

const logoutUser = async ( req, res ) => {
    res.clearCookie('refreshToken')
    res.status(200).send("Logged out")
}

const protectedRoute = async ( req, res ) => {
    try {
    const userId = isAuth(req)
    if ( userId != null ) {
        throw ("Utente non autorizzato")
    }
        res.status(200).send("Utente autorizzato all'accesso")
    } catch(error) {
        res.status(500).send(`Errore nell'accesso alla risorsa: ${error}`)
    }
}

export { registerUser, loginUser, logoutUser, protectedRoute }

