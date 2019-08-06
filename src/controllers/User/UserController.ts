import httpError from "http-errors";
import Joi from "joi";
import { sha512 } from "js-sha512";
import uuid from "uuid/v4";
import DBProcessor from "../../app/DBProcessor";
import MessageClient from "../../app/MessageClient";
import ShopAuthResource from "../../resources/ShopAuthResource";
import UserAuthResource from "../../resources/UserAuthResource";
import UserCollectionResource from "../../resources/UserCollectionResource";
import ShopProductsCollectionResource from "../../resources/ShopProductsCollectionResource";
import UserResource from "../../resources/UserResource";
import AWSConnector from "../../util/AWSConnector";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, awsConnector: AWSConnector) {

    const { connection } = dbProcessor;

    return class UserController {

        public static registerUserValidationSchema = {
            phone_number: Joi.string().min(5).max(15).required(),
        };

        public static loginUserValidationSchema = {
            phone_number: Joi.string().min(5).max(15).required(),
            password: Joi.string().required(),
        };

        public static updateUserValidationSchema = {
            name: Joi.string().optional().allow(null),
            username: Joi.string().optional().allow(null),
            nphone_number: Joi.string().min(5).max(15).optional().allow(null),
            photo: Joi.string().base64().optional().allow(null),
            password: Joi.string().optional().allow(null),
        };

        public static subscribtionValidationSchema = {
            shopId: Joi.string().required(),
            isSubscribed: Joi.bool().required(),
        };
        
        public static changePasswordValidationSchema = {
            code: Joi.string().required(),
            password: Joi.string().required(),
        };


        public static async registerUser(req: any, res: any, next: any) {
            try {
                const {
                    phone_number: phoneNumber,
                }: any = Validator(req.body, UserController.registerUserValidationSchema);

                const id = uuid();

                let user = connection.objects("user").filtered(`phone_number = "${phoneNumber}"`)[0];

                if (user && user.token && user.password) {
                    throw new httpError.BadRequest({ message: "user with such phone number already exist" } as any);
                } else {
                    await  connection.write(async () => {
                        try {
                            const verificationCode = MessageClient.generateCode(4);
                            messageClient.sendMessage(phoneNumber, `Your verification code is: ${verificationCode}`)
                                .then(res => console.log(res))
                                .catch(err => console.log(err));

                            if (user && (!user.token || (user.token && !user.password))) {
                                user.verification_code = verificationCode;
                            } else {
                                user = connection.create("user", { id, create_time: Date(), phone_number: phoneNumber,
                                    verification_code: verificationCode });
                            }

                            next(new UserResource(user));
                        } catch (err) {
                            throw new httpError.ServiceUnavailable({ message: `server error: ` } as any);
                            console.log(err);
                        }
                    });
                }

            } catch (err) {
                next(err);
            }
        }

        public static async requestCode(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];

                if (!user) {
                    throw new httpError.BadRequest({ message: "the user is not exists in the db" } as any);
                } else {
                    await  connection.write(async () => {
                        const verificationCode = MessageClient.generateCode(4);
                        messageClient.sendMessage(user.phone_number, `Your code for password reset is: ${verificationCode}`)
                            .then(res => console.log(res))
                            .catch(err => console.log(err));

                        if (user) {
                            user.verification_code = verificationCode;
                        }

                        next(new UserResource(user));
                    });
                }        
            } catch(err) {
                next(err);
            }
        }

        public static async changePassword(req: any, res: any, next: any){
            try {
                const { password, code } = Validator(req.body, this.changePasswordValidationSchema);
                const { id } = req.params;

                const user = connection.objects("user").filtered(`id = "${id}" AND verification_code = "${code}"`)[0];
                if (!user) throw new httpError.NotFound({ message: "user with such id was not find or have another verification code" } as any);

                await connection.write(() => {
                    user.password = sha512(password);

                    next(new UserResource(user));
                });

            } catch(err) {
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
        public static async loginUser(req: any, res: any, next: any) {
            try {
                const { phone_number: phoneNumber, password } = Validator(req.body, UserController.loginUserValidationSchema);
                const user = connection.objects("user")
                    .filtered(`phone_number = "${phoneNumber}" AND password = "${sha512(password)}" AND token != null`)[0];
                if (!user) throw new httpError.Unauthorized({message: "such account is not exist"} as any);
                else next(new UserAuthResource(user));
            } catch (err) {
                next(err);
            }
        }

        public static async updateUser(req: any, res: any, next: any) {
            try {
                const {
                    phone_number: phoneNumber,
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

        public static checkFavorite(req: any, res: any, next: any) {
            try {
                const { userId, productId } = req.params;
                const user = connection.objects("user").filtered(`id = "${userId}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);

                const product = user.favorite_products.find(({product}: any) => product.id === productId);

                if(product)
                    res.json({inFavorite: true});
                else
                    res.json({inFavorite: false});
            } catch (err) {
                next(err);
            }
        }

        public static checkSubscription(req: any, res: any, next: any) {
            try {
                const { userId, shopId } = req.params;
                const user = connection.objects("user").filtered(`id = "${userId}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);

                const shop = user.subscribed_shops.find((shop: any) => shop.id === shopId);

                if(shop)
                    res.json({isSubscribed: true});
                else
                    res.json({isSubscribed: false});
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

        public static async updateUserSubscription(req: any, res: any, next: any) {
            try {
                const {
                    shopId,
                    isSubscribed
                } = Validator(req.body, UserController.subscribtionValidationSchema);

                const { id } = req.params;
                const shopToSubscribe = connection.objects("shop").filtered(`id = "${shopId}"`)[0];
                if (!shopToSubscribe) throw new httpError.NotFound({message: "shop with such id was not found"} as any);
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);
                const shop = user.subscribed_shops.find((s: any) => s.id === shopId);

                await connection.write(() => {
                    try {
                        if(isSubscribed && shop){
                            res.send({ message: "You're already subscribed to this shop" });
                        } else if(!isSubscribed && shop){
                            const index: Number = user.subscribed_shops.findIndex((s: any) => s.id === shop.id);
                            user.subscribed_shops.splice(index, 1);
                        } else if(!isSubscribed && !shop){
                            res.send({ message: "You have not subscribed to this shop" });
                        } else {
                            user.subscribed_shops.push(shopToSubscribe);
                        }

                        res.send({ message: "successful" });
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({message: "server error"} as any);
                    }
                });
            } catch(e){
                next(e);
            }
        }

        public static async getProductsFeed(req: any, res: any, next: any){
            try {
                const { offset, limit } = req.query;
                const { id } = req.params;
                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);
                const feedProducts = new ShopProductsCollectionResource(user.subscribed_shops, { offset, limit }).uncover();
                res.json(feedProducts.sort((a: any, b: any) => (b.create_time - a.create_time)));
            } catch (err) {
                next(err);
            }
        }
    };
}
