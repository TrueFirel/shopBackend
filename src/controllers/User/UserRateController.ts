import httpError from "http-errors";
import Joi from "joi";
import DBProcessor from "../../app/DBProcessor";
import UserFavoriteCollectionResource from "../../resources/UserFavoriteCollectionResource";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class UserRateController {

        public static RateValidationSchema = {
          product_id: Joi.string().required(),
          is_favorite: Joi.bool().required().allow(null),
        };

        public static async postRate(req: any, res: any, next: any) {
            try {
                const { id: userId } = req.params;
                const {
                    product_id: productId,
                    is_favorite: isFavorite,
                } = Validator(req.body, UserRateController.RateValidationSchema);

                const catalogProduct = connection.objects("product").filtered(`id = "${productId}"`)[0];
                if (!catalogProduct) throw new httpError.NotFound({message: "product with such id was not found"} as any);
                const user = connection.objects("user").filtered(`id = "${userId}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);
                const product = user.favorite_products.find(({ product }: any) => product.id === productId);
                await connection.write(() => {
                    try {
                        if (!product) {
                            const favorite = connection.create("favorite", {
                                user_id: userId,
                                product: catalogProduct,
                                is_favorite: isFavorite,
                            });
                            user.favorite_products.push(favorite);
                        } else {
                            product.is_favorite = isFavorite;
                        }
                        res.send({ message: "successful" });
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({message: "server error"} as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static getUserRates(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const { offset, limit } = req.query;

                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);
                const favorites = user.favorite_products;

                next(new UserFavoriteCollectionResource(favorites, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
