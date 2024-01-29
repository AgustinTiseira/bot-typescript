import express from "express"
import { createReadStream } from "fs"
import { join } from "path"
const app = express()

const PORT = process.env?.PORT ?? 3000

/**
 * inicia tu servicio HTTP (web)
 */
const initServer = (botInstance: any) => {

    app.get('/callback', (req, res) => {
        const query = req.query
        console.log(`[QUERY]:`, query)

        if (query && query?.status === 'fail') {
            res.redirect(`https://app.codigoencasa.com`)
            return
        }

        res.send(`Todo Ok`)
    })


    app.listen(PORT, () => {
        console.log(`http://locahost:${PORT} listo!`)
    })
}

export { initServer }