import pkg from 'jsonwebtoken' // libreria per la gestione di JSON Web token
const { verify } = pkg

// funzione per verificare che il token nell'header della richiesta sia valido
const isAuth = ( req, res ) => {
    const authorization = res.headers['authotization']
    if ( !authorization ) {
        throw ('You need to login')
    }
    const token = authorization.split(" ")[1]
    const { userId }  = verify( {token}, process.env.ACCESS_TOKEN_SECRET )
    return userId
}

export { isAuth }