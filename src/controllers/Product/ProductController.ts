import httpError from "http-errors";
import Joi from "joi";
import uuid = require("uuid");
import DBProcessor from "../../app/DBProcessor";
import { Event } from "../../constants/Events";
import ProductCollectionResource from "../../resources/ProductCollectionResource";
import ProductResource from "../../resources/ProductResource";
import ShopResource from "../../resources/ShopResource";
import shop from "../../schemas/shop";
import ArrayStreamliner from "../../util/ArrayStreamliner";
import AWSConnector from "../../util/AWSConnector";
import RealmListConverter from "../../util/RealmListConverter";
import Validator from "../../util/Validator";

const DEFAULT_AMOUNT_OF_LATEST_PRODUCTS = 5;

export default function(dbProcessor: DBProcessor, awsConnector: AWSConnector) {

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

                let photo: any = null;
                if (req.file) photo = (await awsConnector.updateFile(req.file)).Location;

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
                            web_site: webSite, price, shop, id, likes: 0, dislikes: 0,
                            create_time: new Date(),
                        });
                        if (photo) {
                            const photoInstance = connection.create("product_photo", { id: uuid(), product_id: product.id, photo});
                            product.photo.push(photoInstance);
                        }
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

                let photo: any = null;
                if (req.file) photo = (await awsConnector.updateFile(req.file)).Location;

                if (!productName && !eventName && !description && !webSite && !price && !photo) {
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
                    if (photo) {
                        const photoInstance = connection.create("product_photo", { id: uuid(), product_id: product.id, photo});
                        product.photo.push(photoInstance);
                    }
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
                const { offset, limit, sort, order, filter, filter_value, search_value } = req.query;

                const { id } = req.params;

                let products: ArrayStreamliner;

                if (id) {
                    const shop = connection.objects("shop").filtered(`id = "${id}"`)[0];
                    if (!shop) throw new httpError.NotFound({ message: "shop with such id was not found" } as any);
                    const productsResource = new ProductCollectionResource(shop.products, {}).uncover();
                    products = new ArrayStreamliner(productsResource.data);
                } else {
                    const productsResource = new ProductCollectionResource(connection.objects("product"), {}).uncover();
                    products = new ArrayStreamliner(productsResource.data);
                }

                if (search_value) products.searchByString("product_name", search_value);

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

        public static getLatestProducts(req: any, res: any, next: any) {
            try {
                const { amount } = req.query;
                const amountOfProducts = amount ? amount : DEFAULT_AMOUNT_OF_LATEST_PRODUCTS;
                const products = connection.objects("product");

                next(new ProductCollectionResource(products.slice(products.length - amountOfProducts, products.length), {}));
            } catch (err) {
                next(err);
            }
        }

        public static async deleteProductPhoto(req: any, res: any, next: any) {
            try {
                const { product_id, id } = req.params;

                if (!product_id && !id) {
                    throw new httpError.BadRequest({ message: "query must contain product_id and id" } as any);
                }
                const removingPhoto = connection.objects("product_photo")
                    .find((photo: any) => photo.id === id && photo.product_id === product_id);
                if (!removingPhoto) throw new httpError.NotFound({ message: "requested photo was not found" } as any);
                await connection.write(() => {
                    connection.delete(removingPhoto);
                });
                next({ message: "success" });
            } catch (err) {
                next(err);
            }
        }

        public static async deleteProduct(req: any, res: any, next: any) {
            try {
                const { product_id } = req.params;

                if (!product_id) {
                    throw new httpError.BadRequest({ message: "query must contain product_id" } as any);
                }
                const removingProduct = connection.objects("product")
                    .find((product: any) => product.id === product_id);
                if (!removingProduct) throw new httpError.NotFound({ message: "requested product was not found" } as any);
                await connection.write(() => {
                    connection.delete(removingProduct);
                });
                next({ message: "success" });
            } catch (err) {
                next(err);
            }
        }
    };
}
