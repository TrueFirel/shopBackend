import httpError from "http-errors";
import Joi from "joi";
import { sha512 } from "js-sha512";
import uuid from "uuid/v4";
import DBProcessor from "../../app/DBProcessor";
import MessageClient from "../../app/MessageClient";
import ShopAuthResource from "../../resources/ShopAuthResource";
import UserAuthResource from "../../resources/UserAuthResource";
import UserCollectionResource from "../../resources/UserCollectionResource";
import UserResource from "../../resources/UserResource";
import AWSConnector from "../../util/AWSConnector";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, awsConnector: AWSConnector) {

    const { connection } = dbProcessor;

    return class UserController {

        public static registerUserValidationSchema = {
            number: Joi.string().min(5).max(15).required(),
        };

        public static loginUserValidationSchema = {
            number: Joi.string().min(5).max(15).required(),
            password: Joi.string().required(),
        };

        public static updateUserValidationSchema = {
            name: Joi.string().optional().allow(null),
            username: Joi.string().optional().allow(null),
            number: Joi.string().min(5).max(15).optional().allow(null),
            photo: Joi.string().base64().optional().allow(null),
            password: Joi.string().optional().allow(null),
        };

        public static async registerUser(req: any, res: any, next: any) {
            try {
                const {
                    number: phoneNumber,
                }: any = Validator(req.body, UserController.registerUserValidationSchema);

                const id = uuid();

                let user = connection.objects("user").filtered(`phone_number = "${phoneNumber}"`)[0];

                if (user && user.token) throw new httpError.BadRequest({ message: "user with such phone number already exist" } as any);
                else {
                    await  connection.write(async () => {
                        try {
                            const verificationCode = MessageClient.generateCode(4);
                            messageClient.sendMessage(phoneNumber, `Your verification code is: ${verificationCode}`);

                            if (user && !user.token) user.verification_code = verificationCode;
                            else {
                                user = connection.create("user", { id, create_time: Date(), phone_number: phoneNumber,
                                    verification_code: verificationCode });
                            }

                            next(new UserResource(user));
                        } catch (err) {
                            throw new httpError.ServiceUnavailable({ message: `server error: ` } as any);
                        }
                    });
                }

            } catch (err) {
                next(err);
            }
        }

        public static async verifyPhoneNumber(req: any, res: any, next: any) {
            try {
                const { code } = Validator(req.body, { code: Joi.string() });
                const { id } = req.params;

                const user = connection.objects("user").filtered(`id = "${id}" AND verification_code = "${code}"`)[0];
                if (!user) throw new httpError.NotFound({ message: "user with such id was not find or already verified" } as any);
                await connection.write(() => {
                    try {
                        user.verification_code = null;
                        user.token = dbProcessor.createToken(id);
                        user.is_verified = true;
                        next(new UserAuthResource(user));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        // Need to be moved to another controller
        public static async loginAccount(req: any, res: any, next: any) {
            try {
                const { number: phoneNumber, password } = Validator(req.body, UserController.loginUserValidationSchema);
                const user = connection.objects("user")
                    .filtered(`phone_number = "${phoneNumber}" AND password = "${sha512(password)}" AND token != null`)[0];
                if (!user) {
                    const shop = connection.objects("shop")
                        .filtered(`contact_number = "${phoneNumber}" AND password = "${sha512(password)}" AND token != null`)[0];
                    if (!shop) {
                        throw new httpError.Unauthorized({message: "such account is not exist"} as any);
                    }
                    next(new ShopAuthResource(shop));
                } else next(new UserAuthResource(user));
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
                    password,
                } = Validator(req.body, UserController.updateUserValidationSchema);

                const { id } = req.params;
                let photo: any = null;
                if (req.file) photo = (await awsConnector.updateFile(req.file)).Location;

                if (!phoneNumber && !name && !username && !photo && !password) {
                    throw new httpError.BadRequest({message: "parameters for update user was expected"} as any);
                }
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);
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

        public static getUser(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);
                next(new UserResource(user));
            } catch (err) {
                next(err);
            }
        }

        public static getUsers(req: any, res: any, next: any) {
            try {
                const { offset, limit } = req.query;
                const users = connection.objects("user");
                next(new UserCollectionResource(users, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
