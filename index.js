const express = require('express')

const app = express()

const port = process.env.PORT || 5000



app.get('/', (req, res)=>{
    res.send("e-commerce for student is coming")
})

app.listen(port, ()=>{
    console.log(`The port is running the port ${port}`)
})

