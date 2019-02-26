import httpError from "http-errors";
import Joi from "joi";
import {sha512} from "js-sha512";
import uuid = require("uuid");
import DBProcessor from "../../app/DBProcessor";
import MessageClient from "../../app/MessageClient";
import ShopAuthResource from "../../resources/ShopAuthResource";
import ShopCollectionResource from "../../resources/ShopCollectionResource";
import ShopResource from "../../resources/ShopResource";
import AWSConnector from "../../util/AWSConnector";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, awsConnector: AWSConnector) {

    const { connection } = dbProcessor;

    return class ShopController {

        public static RegisterShopValidationSchema = {
            phone_number: Joi.string().required(),
        };

        public static UpdateShopValidationSchema = {
            company_name: Joi.string().optional(),
            address: Joi.string().optional(),
            web_site: Joi.string().optional(),
            photo: Joi.string().base64().optional(),
            phone_number: Joi.string().optional(),
            password: Joi.string().optional(),
        };

        public static async verifyPhoneNumber(req: any, res: any, next: any) {
            try {
                const { code } = Validator(req.body, { code: Joi.string() });
                const { id } = req.params;

                const shop = connection.objects("shop").filtered(`id = "${id}" AND verification_code = "${code}"`)[0];
                if (!shop) throw new httpError.NotFound({ message: "shop with such id was not found or already verified" } as any);
                await connection.write(() => {
                    try {
                        shop.verification_code = null;
                        shop.token = dbProcessor.createToken(id);
                        shop.is_verified = true;
                        next(new ShopAuthResource(shop));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static async registerShop(req: any, res: any, next: any) {
            try {
                const {
                    phone_number: contactNumber,
                } = Validator(req.body, ShopController.RegisterShopValidationSchema);

                const id = uuid();

                let shop = connection.objects("shop").filtered(`phone_number = "${contactNumber}"`)[0];

                if (shop && shop.token) throw new httpError.Unauthorized({ message: "shop with such contact number already exist" } as any);
                else {
                    await connection.write(() => {
                        try {
                            const verificationCode = MessageClient.generateCode(4);
                            messageClient.sendMessage(contactNumber, `Your verification code is: ${verificationCode}`);

                            if (shop && !shop.token) {
                                shop.verification_code = verificationCode;
                            } else {
                                shop = connection.create("shop", {id, phone_number: contactNumber, create_time: new Date(),
                                    verification_code: verificationCode });
                            }

                            next(new ShopResource(shop));
                        } catch (err) {
                            throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                        }
                    });
                }

            } catch (err) {
                next(err);
            }
        }

        public static async updateShop(req: any, res: any, next: any) {
            try {
                const {
                    company_name: companyName,
                    address,
                    web_site: webSite,
                    phone_number: contactNumber,
                    password,
                } = Validator(req.body, ShopController.UpdateShopValidationSchema);
                const { id } = req.params;

                let photo: any = null;
                if (req.file) photo = (await awsConnector.updateFile(req.file)).Location;

                if (!companyName && !address && !webSite && !photo && !contactNumber && !password) {
                    throw new httpError.BadRequest({message: "parameters for update shop was expected"} as any);
                }

                const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                if (!shop) throw new httpError.NotFound({ message: "shop with such id was not found" } as any);

                await connection.write(() => {
                    try {
                        if (companyName) shop.company_name = companyName;
                        if (address) shop.address = address;
                        if (webSite) shop.web_site = webSite;
                        if (photo) shop.photo = photo;
                        if (contactNumber) shop.phone_number = contactNumber;
                        if (password) shop.password = sha512(password);

                        next(new ShopResource(shop));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static getShop(req: any, res: any, next: any) {
            try {
                const { id } = req.params;

                const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                if (!shop) throw new httpError.BadRequest({message: "shop with such id was not found"} as any);

                next(new ShopResource(shop));
            } catch (err) {
                next(err);
            }
        }

        public static getShops(req: any, res: any, next: any) {
            try {
                const { offset, limit } = req.query;

                const shops = connection.objects("shop");

                next(new ShopCollectionResource(shops, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
