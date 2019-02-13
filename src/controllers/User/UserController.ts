import httpError from "http-errors";
import Joi from "joi";
import { sha512 } from "js-sha512";
import uuid from "uuid/v4";
import DBProcessor from "../../app/DBProcessor";
import UserAuthResource from "../../resources/UserAuthResource";
import UserResource from "../../resources/UserResource";
import Validator from "../../util/Validator";

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

        public static loginUserValidationSchema = {
            number: Joi.string().min(5).max(15).required(),
            password: Joi.string().required(),
        };

        public static updateUserValidationSchema = {
            name: Joi.string().optional().allow(null),
            username: Joi.string().optional().allow(null),
            number: Joi.string().min(5).max(15).optional().allow(null),
            photo: Joi.string().optional().allow(null),
            password: Joi.string().optional().allow(null),
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

                if (connection.objects("user").filtered(`phone_number = "${phoneNumber}"`).length) {
                    throw new httpError.BadRequest({ message: "User with such phone number already exist" } as any);
                }

                await  connection.write(async () => {

                    try {
                        const user = await connection.create("user", { id, token, username, name,
                            password: sha512(password), create_time: Date(), phone_number: phoneNumber, photo });
                        next(new UserAuthResource(user));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static async loginUser(req: any, res: any, next: any) {
            try {
                const { number: phoneNumber, password } = Validator(req.body, UserController.loginUserValidationSchema);
                const user = connection.objects("user")
                    .filtered(`phone_number = "${phoneNumber}" AND password = "${sha512(password)}"`);
                if (!user.length) throw new httpError.Unauthorized({message: "Such user is not exist"} as any);
                next(new UserAuthResource(user[0]));
            } catch (err) {
                next(err);
            }
        }

        public static async updateUser(req: any, res: any, next: any) {
            try {
                const {
                    number: phoneNumber,
                    name,
                    username,
                    photo,
                    password,
                } = Validator(req.body, UserController.updateUserValidationSchema);

                const { id } = req.params;

                if (!phoneNumber && !name && !username && !photo && !password) {
                    throw new httpError.BadRequest({message: "Parameters for update user was expected"} as any);
                }
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.NotFound({message: "User with such id was not found"} as any);
                else {
                    await connection.write(() => {
                        try {
                            if (phoneNumber) user.phone_number = phoneNumber;
                            if (name) user.name = name;
                            if (username) user.username = username;
                            if (photo) user.photo = photo;
                            if (password) user.password = sha512(password);
                            next(new UserResource(user));
                        } catch (err) {
                            throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                        }
                    });
                }
            } catch (err) {
                next(err);
            }
        }

        public static async getUser(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                next(new UserResource(user));
            } catch (err) {
                next(err);
            }
        }
    };
}
