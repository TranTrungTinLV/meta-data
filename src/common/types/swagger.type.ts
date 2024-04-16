export type SwaggerMethod<T> = {
  [key in keyof T]: (summary: string) => MethodDecorator;
};
