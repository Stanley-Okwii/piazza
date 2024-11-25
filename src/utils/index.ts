import { Response } from "express";


export const validateRequest = (
  validate: Function,
  requestBody: Object,
  response: Response
) => {
  const { error } = validate(requestBody);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
};
