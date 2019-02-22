import TwilioClient, { Twilio } from "twilio";

interface IMessageClientOptions {
    sid: string;
    token: string;
    number: string;
}

export default class MessageClient {

    public static generateCode(amountOfNumbers: number) {
        const generate = () => ((Math.random() * (9 - 1)) + 1).toFixed();
        let result = "";
        for (let i = 0; i < amountOfNumbers; i++) {
            result += generate().toString();
        }
        return result;
    }
    public options: IMessageClientOptions;
    public client: Twilio;

    constructor(options: IMessageClientOptions) {
        this.options = options;
        this.client = TwilioClient(this.options.sid, this.options.token);
    }

    public async sendMessage(recepientNumber: string, message: string) {
        return await this.client.messages.create({
            body: message,
            from: this.options.number,
            to: recepientNumber,
        });
    }
}
