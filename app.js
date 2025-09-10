import { PrismaClient } from './generated/prisma/index.js'
import express from 'express'

const prisma = new PrismaClient()

async function main(){
  // scrivere queries qui
  
  // creazione nuovo record nella tabella weather
  await prisma.weather.create({
    data: {
      city : 'Bologna',
      temp_lo : 10,
      temp_hi : 30
      }
  })
  
  // update record nella tabella weather con field city = "San Francisco" 
  const post = await prisma.weather.update({
    where : { city : "San Francisco"},
    data : { temp_lo : 10, temp_hi : 25}
  })

  // select di tutta la tabella weather
  const allRecords = await prisma.weather.findMany()
  console.log(allRecords)

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
