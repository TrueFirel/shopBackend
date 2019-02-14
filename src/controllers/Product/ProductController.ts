import httpError from "http-errors";
import Joi from "joi";
import uuid = require("uuid");
import DBProcessor from "../../app/DBProcessor";
import { Event } from "../../constants/Events";
import ProductResource from "../../resources/ProductResource";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class ProductController {

        public static AddProductValidationSchema = {
            product_name: Joi.string().required(),
            event_name: Joi.string().required(),
            description: Joi.string().required(),
            web_site: Joi.string().required(),
            price: Joi.number().required(),
        };

        public static async AddProduct(req: any, res: any, next: any) {
            try {
                const {
                    product_name: productName,
                    event_name: eventName,
                    description,
                    web_site: webSite,
                    price,
                }: any = Validator(req.body, ProductController.AddProductValidationSchema);
                const id = uuid();

                const { id: shopId }= req.params;

                if (!Event[eventName]) {
                    throw new httpError.NotFound({ message: "event with such name was not found" } as any);
                }
                if (!connection.objects("shop").filtered(`id = "${shopId}"`).length) {
                    throw new httpError.NotFound({ message: "Shop with such id was not found" } as any);
                }
                await connection.write(() => {
                    try {
                        const product = connection.create("product", {
                            product_name: productName, event_name: Event[eventName], description,
                            web_site: webSite, price, shop_id: shopId, id,
                        });
                        next(new ProductResource(product));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }
    };
}
