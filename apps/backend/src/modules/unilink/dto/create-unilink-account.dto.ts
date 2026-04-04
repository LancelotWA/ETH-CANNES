import { IsUUID } from "class-validator";

export class CreateUnilinkAccountDto {
  @IsUUID()
  userId!: string;
}
