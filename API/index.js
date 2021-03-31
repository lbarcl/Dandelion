const express = require('express')
const app = express()
const port = 1250

app.listen(port, () => console.log(`Port ${port} dinleniyor`))
module.exports = (client) => {
    app.get('/servers/:id', (req, res) => {
        console.log(client.servers)
        console.log(req.params.id)
    })
}