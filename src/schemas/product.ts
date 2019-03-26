export default {
    name: "product",
    properties: {
        id: "string",
        product_name: "string",
        description: "string",
        event_name: "string",
        web_site: "string",
        price: "double",
        shop: "shop",
        create_time: "date",
        reviews: "review[]",
        likes: {
            optional: true,
            type: "int",
        },
        dislikes: {
            optional: true,
            type: "int",
        },
        photo: "product_photo[]",
    },
};
