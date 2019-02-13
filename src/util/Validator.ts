import httpError from "http-errors";
import Joi from "joi";

export default function(data: any, validationSchema: any) {
    const result: any = Joi.validate(data, validationSchema, {abortEarly: false});
    if (result.error) throw new httpError.BadRequest({message: "Validation error", data: result.error.details} as any);

    return result.value;
}
