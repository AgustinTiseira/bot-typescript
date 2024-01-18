import axios from "axios"

export const getEvents = async (dia: string) => {
    try {
        const webhookUrl = 'https://hook.us1.make.com/s41q271g9ydffyqr6gw3b15v7facnrfe'
        const res = await axios.post(webhookUrl, { dia })
        return res.data
    } catch (err) {
        console.log(`[ERROR]:`, err)
    }
}