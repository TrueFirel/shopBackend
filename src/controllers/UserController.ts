import Joi from "joi";
import uuid from "uuid/v4";
import DBProcessor from "../app/DBProcessor";
import UserResource from "../resources/UserResource";
import Validator from "../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class UserController {

        public static registerUserValidationSchema = {
            number: Joi.string().min(5).max(15).required(),
            name: Joi.string().required(),
            username: Joi.string().required(),
            photo: Joi.string().optional(),
            password: Joi.string().required(),
        };
        public static async registerUser(req: any, res: any, next: any) {
            try {
                const {
                    number: phoneNumber,
                    name,
                    username,
                    photo,
                    password,
                }: any = Validator(req.body, UserController.registerUserValidationSchema);

                const id = uuid();
                const token = dbProcessor.createToken(id);

                await  connection.write(async () => {
                    const user = await connection.create("user",
                        { id, token, username, name, password, create_time: Date(), phone_number: phoneNumber, photo });
                    next(new UserResource(user));
                });
            } catch (err) {
                next(err);
            }
        }
    };
}
