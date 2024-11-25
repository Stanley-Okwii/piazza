export const createValidation = (
  validator: Function,
  requestBody: any,
  response: any
) => {
  const { error } = validator(requestBody);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
};
