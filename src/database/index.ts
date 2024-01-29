import MongoAdapter from '@bot-whatsapp/database/mongo';

const MONGO_DB_URI =
    "mongodb+srv://Tisineitor:mk8QrbQJ5HE85mzE@reservasbot.qrmnl8y.mongodb.net/?retryWrites=true&w=majority" ||
    "";
const MONGO_DB_NAME = "don't-forget-love";



export default new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
})