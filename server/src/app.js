const express= require('express')
const cors = require('cors')
const ticketRouter = require('./routes/ticket.routes')
const authRouter = require('./routes/auth.routes')
const env = require('../env')
const errorHandler = require('./middleware/errorHandler')
const app= express()
const PORT = env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:'true'}))
app.use(cors({
    origin: env.clientUrl,
    allowedHeaders: ['Authorization', 'Content-Type']
}))

app.use('/api/auth', authRouter)
app.use('/api/tickets', ticketRouter)
app.use(errorHandler)

app.listen(PORT, ()=>{
    `Server is Running on port ${PORT}`
})

