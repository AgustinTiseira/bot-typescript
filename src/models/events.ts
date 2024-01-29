import { model, Schema } from "mongoose"

export interface IEvents {
    summary: string;
    start: string
    end: string
    ID: string
}

export interface IEventsSchema {
    phoneNumber: string;
    name: string;
    events: IEvents[];
}

const EventsSchema = new Schema<IEventsSchema>({
    phoneNumber: {
        type: String,
    },
    name: {
        type: String,
    },
    events: {
        type: [Object],
    },
});

export default model<IEventsSchema>("Event", EventsSchema);
