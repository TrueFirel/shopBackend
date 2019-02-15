export default {
    name: "product",
    properties: {
        id: "string",
        product_name: "string",
        description: "string",
        event_name: "string",
        web_site: "string",
        price: "double",
        shop_id: "string",
        reviews: "review[]",
        likes: {
            optional: true,
            type: "int",
        },
        dislikes: {
            optional: true,
            type: "int",
        },
    },
};
