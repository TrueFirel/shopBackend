export default {
    name: "user",
    properties: {
        id: "string",
        token: "string",
        username: "string",
        name: "string",
        password: "string",
        create_time: "date",
        phone_number: "string",
        photo: {
            type: "string",
            optional: true,
        },
    },
};
