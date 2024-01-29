import express from "express"
import { createReadStream } from "fs"
import { join } from "path"
import mongoose from "mongoose"
const app = express()

const PORT = process.env?.PORT ?? 3000

/**
 * inicia tu servicio HTTP (web)
 */
const initServer = (botInstance: any) => {

    const MONGO_DB_URI =
        "mongodb+srv://Tisineitor:mk8QrbQJ5HE85mzE@reservasbot.qrmnl8y.mongodb.net/?retryWrites=true&w=majority" ||
        "";

    const option = {
        maxPoolSize: 50,
        wtimeoutMS: 2500
    };

    mongoose
        .connect(MONGO_DB_URI, option)
        .then(() => {
            console.log("Established connection DB");
        })
        .catch((err) => {
            console.error(err);
        });

    /*     app.get('/callback', (req, res) => {
            
            res.send(`Todo Ok`)
        })
     */
    app.listen(PORT, () => {
        console.log(`http://locahost:${PORT} ready!`)
    })
}

export { initServer }