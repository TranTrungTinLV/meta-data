import { ArrayMinSize, IsArray } from "class-validator";

export class BulkDeleteCategoryDto {
  @ArrayMinSize(1)
  @IsArray()
  listId: string[];
}
