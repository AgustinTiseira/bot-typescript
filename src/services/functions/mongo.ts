import Event, { IEvents } from "src/models/events"

export const createUser = async (phoneNumber: string, name: string) => {
    console.log(phoneNumber, name, "PHONE NUMBER AND NAME")
    try {
        const newEvent = new Event({
            phoneNumber: phoneNumber,
            name: name,
            events: []
        })

        await newEvent.save()
        return newEvent
    }
    catch (err) {
        console.error(`[ERROR = createUser]:`, err, { phoneNumber, name })
    }
}

export const findUser = async (phoneNumber: string) => {
    console.log(phoneNumber, "PHONE NUMBER FIND USER")
    try {
        const user = Event.findOne({ phoneNumber })
        return user
    }
    catch (err) {
        console.error(`[ERROR = findUser]:`, err, { phoneNumber })
    }
}

export const updateEvents = async (phoneNumber: string, event: IEvents) => {
    try {
        const user = await findUser(phoneNumber)
        if (!user) {
            console.error(`[ERROR = updateEvents]:`, `No se encontro el usuario con el numero ${phoneNumber}`)
            return
        }
        const userEvents = user.events
        userEvents.push(event)
        await Event.findOneAndUpdate({ phoneNumber }, { events: userEvents })
    } catch (err) {
        console.error(`[ERROR = updateEvents]:`, err)
    }
}

export const deleteEvent = async (phoneNumber: string, eventID: string) => {
    try {
        const user = await findUser(phoneNumber)
        if (!user) {
            console.error(`[ERROR = deleteEvent]:`, `No se encontro el usuario con el numero ${phoneNumber}`)
            return
        }
        const userEvents = user.events
        const filteredEvents = userEvents.filter(event => event.ID !== eventID)
        await Event.findOneAndUpdate({ phoneNumber }, { events: filteredEvents })
    } catch (err) {
        console.error(`[ERROR = deleteEvent]:`, err, { eventID, phoneNumber })
    }
}

