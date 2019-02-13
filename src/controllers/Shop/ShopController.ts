import httpError from "http-errors";
import Joi from "joi";
import {sha512} from "js-sha512";
import uuid = require("uuid");
import DBProcessor from "../../app/DBProcessor";
import ShopAuthResource from "../../resources/ShopAuthResource";
import ShopResource from "../../resources/ShopResource";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class ShopController {

        public static RegisterShopValidationSchema = {
            company_name: Joi.string().required(),
            address: Joi.string().required(),
            web_site: Joi.string().required(),
            photo: Joi.string().optional(),
            contact_number: Joi.string().required(),
            password: Joi.string().required(),
        };

        public static UpdateShopValidationSchema = {
            company_name: Joi.string().optional(),
            address: Joi.string().optional(),
            web_site: Joi.string().optional(),
            photo: Joi.string().optional(),
            contact_number: Joi.string().optional(),
            password: Joi.string().optional(),
        };

        public static async registerShop(req: any, res: any, next: any) {
            try {

                const {
                    company_name: companyName,
                    address,
                    web_site: webSite,
                    photo,
                    contact_number: contactNumber,
                    password,
                } = Validator(req.body, ShopController.RegisterShopValidationSchema);

                const id = uuid();
                const token = dbProcessor.createToken({id});

                if (connection.objects("shop").filtered(`contact_number = "${contactNumber}"`).length) {
                    throw new httpError.Unauthorized({ message: "Shop with such contact number already exist" } as any);
                }
                await connection.write(() => {
                    try {
                        const shop = connection.create("shop", {id, token, company_name: companyName, address,
                            web_site: webSite, photo, contact_number: contactNumber, create_time: new Date(), password: sha512(password) });
                        next(new ShopAuthResource(shop));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
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
                    photo,
                    contact_number: contactNumber,
                    password,
                } = Validator(req.body, ShopController.UpdateShopValidationSchema);
                const { id } = req.params;

                if (!companyName && !address && !webSite && !photo && !contactNumber && !password) {
                    throw new httpError.BadRequest({message: "Parameters for update shop was expected"} as any);
                }

                const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                if (!shop) throw new httpError.NotFound({ message: "Shop with such id was not found" } as any);

                await connection.write(() => {
                    try {
                        if (companyName) shop.company_name = companyName;
                        if (address) shop.address = address;
                        if (webSite) shop.web_site = webSite;
                        if (photo) shop.photo = photo;
                        if (contactNumber) shop.contact_number = contactNumber;
                        if (password) shop.password = password;

                        next(new ShopResource(shop));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static async getShop(req: any, res: any, next: any) {
            try {
                const { id } = req.params;

                const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                if (!shop) throw new httpError.BadRequest({message: "Shop with such id was not found"} as any);

                next(new ShopResource(shop));
            } catch (err) {
                next(err);
            }
        }
    };
}
