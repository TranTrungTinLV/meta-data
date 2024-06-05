/* eslint-disable prettier/prettier */
import { GenerateApiSwagger } from "src/common/decorators/generate-api-swagger.decorator";
import { SwaggerMethod } from "src/common/types/swagger.type";
import { UploadController } from "./uploads.controller";

export const docUpload: SwaggerMethod<UploadController> = {
  uploadFile: (summary: string) =>
    GenerateApiSwagger(
      summary,
      { OK: "Upload image successfully" },
      { isBearer: true, file: true }
    ),

  getIndexExcel: (summary: string) =>
    GenerateApiSwagger(summary, { OK: "Get index successfully" }),
  importV2: (summary: string) =>
    GenerateApiSwagger(summary, { OK: "Import successfully" }),
};
