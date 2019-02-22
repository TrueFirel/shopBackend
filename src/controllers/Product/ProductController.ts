import httpError from "http-errors";
import Joi from "joi";
import uuid = require("uuid");
import DBProcessor from "../../app/DBProcessor";
import { Event } from "../../constants/Events";
import ProductCollectionResource from "../../resources/ProductCollectionResource";
import ProductResource from "../../resources/ProductResource";
import shop from "../../schemas/shop";
import ArrayStreamliner from "../../util/ArrayStreamliner";
import RealmListConverter from "../../util/RealmListConverter";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class ProductController {

        public static UpdateProductValidationSchema = {
            product_name: Joi.string().optional(),
            event_name: Joi.string().optional(),
            description: Joi.string().optional(),
            web_site: Joi.string().optional(),
            price: Joi.number().optional(),
        };

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

                const { id: shopId } = req.params;

                if (!Event[eventName]) {
                    throw new httpError.NotFound({ message: "event with such name was not found" } as any);
                }

                const shop = connection.objects("shop").filtered(`id = "${shopId}"`)[0];

                if (!shop) {
                    throw new httpError.NotFound({ message: "shop with such id was not found" } as any);
                }
                await connection.write(() => {
                    try {
                        const product = connection.create("product", {
                            product_name: productName, event_name: eventName, description,
                            web_site: webSite, price, shop_id: shopId, id, likes: 0, dislikes: 0,
                            create_time: new Date(),
                        });
                        shop.products.push(product);
                        next(new ProductResource(product));
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static async updateProduct(req: any, res: any, next: any) {
            try {
                const {
                    product_name: productName,
                    event_name: eventName,
                    description,
                    web_site: webSite,
                    price,
                }: any = Validator(req.body, ProductController.UpdateProductValidationSchema);

                if (!productName && !eventName && !description && !webSite && !price) {
                    throw new httpError.BadRequest({ message: "parameters for update user was expected" } as any);
                }

                const { shopId, id: productId } = req.params;
                const shop = connection.objects("shop").filtered(`id = "${shopId}"`)[0];
                if (!shop) {
                    throw new httpError.NotFound({ message: "shop with such id was not found"} as any);
                }
                const products = shop.products;
                const product = products.find((product: any) => product.id === productId);
                if (!product) {
                    throw new httpError.NotFound({ message: "product with such id was not found"} as any);
                }
                await connection.write(() => {
                    if (productName) product.product_name = productName;
                    if (eventName) product.event_name = eventName;
                    if (description) product.description = description;
                    if (webSite) product.web_site = webSite;
                    if (price) product.price = price;
                    next(new ProductResource(product));
                });
            } catch (err) {
                next(err);
            }
        }

        public static getProduct(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const product = connection.objects("product").filtered(`id = "${id}"`)[0];
                if (!product) {
                    throw new httpError.NotFound({ message: "product with such id was not found"} as any);
                }
                next(new ProductResource(product));
            } catch (err) {
                next(err);
            }
        }

        public static getProducts(req: any, res: any, next: any) {
            try {
                const { offset, limit, sort, order, filter, filter_value  } = req.query;

                const { id } = req.params;

                let products: ArrayStreamliner;

                if (id) {
                    const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                    if (!shop) throw new httpError.NotFound({ message: "shop with such id was not found" } as any);
                    products = new ArrayStreamliner(new RealmListConverter(shop.products).data);
                } else products = new ArrayStreamliner(new RealmListConverter(connection.objects("product")).data);

                if  (filter_value && filter === "price") products.filterLessNumbers(filter, filter_value);
                if  (filter_value && filter === "event_name") products.filterByString(filter, filter_value);

                if (sort && (sort === "likes" || sort === "create_time" || sort === "reviews")) {
                    if (sort === "reviews") products.sortByNumber(`${sort}.length`, order);
                    else if (sort === "create_time") products.sortByDate(sort, order);
                    else products.sortByNumber(sort, order);
                }

                next(new ProductCollectionResource(products.data, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
