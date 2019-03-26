import httpError from "http-errors";
import Joi from "joi";
import DBProcessor from "../../app/DBProcessor";
import UserFavoriteCollectionResource from "../../resources/UserFavoriteCollectionResource";
import ArrayStreamliner from "../../util/ArrayStreamliner";
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
                            if (isFavorite !== null) {
                                const favorite = connection.create("favorite", {
                                    user_id: userId,
                                    product: catalogProduct,
                                    is_favorite: isFavorite,
                                });
                                user.favorite_products.push(favorite);
                            }
                            if (isFavorite) catalogProduct.likes += 1;
                            if (isFavorite === false) catalogProduct.dislikes += 1;
                        } else {
                            if (isFavorite === null) {
                                if (product.is_favorite) catalogProduct.likes -= 1;
                                else catalogProduct.dislikes -= 1;
                                const favoriteProduct = connection.objects("favorite")
                                    .find((favorite: any) => favorite.product.id === product.product.id);
                                connection.delete(favoriteProduct);
                            } else {
                                if (product.is_favorite && isFavorite === false) {
                                    catalogProduct.likes -= 1;
                                    catalogProduct.dislikes += 1;
                                }
                                if (product.is_favorite === false && isFavorite === true) {
                                    catalogProduct.likes += 1;
                                    catalogProduct.dislikes -= 1;
                                }
                                product.is_favorite = isFavorite;
                            }
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
                const { offset, limit, sort, order, filter, filter_value } = req.query;

                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);
                const favoriteResource = new UserFavoriteCollectionResource(user.favorite_products, {}).uncover();
                const favorites = new ArrayStreamliner(favoriteResource.data);

                if  (filter_value && filter === "price") favorites.filterLessNumbers(`product.${filter}`, filter_value);
                if  (filter_value && filter === "event_name") favorites.filterByString(`product.${filter}`, filter_value);

                if (sort && (sort === "likes" || sort === "create_time" || sort === "reviews")) {
                    if (sort === "reviews") favorites.sortByNumber("product.reviews.length", order);
                    else if (sort === "create_time") favorites.sortByDate("product.create_time", order);
                    else favorites.sortByNumber("product.likes", order);
                }

                next(new UserFavoriteCollectionResource(favorites.data, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
