export default {
    name: "favorite",
    properties: {
        product: "product",
        user_id: "string",
        is_favorite: {
            type: "bool",
            optional: true,
        },
    },
};
