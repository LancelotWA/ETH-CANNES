import { IsString, Matches } from "class-validator";

export class ResolveEnsDto {
  @IsString()
  @Matches(/^[a-z0-9-]+\.eth$/i, { message: "Invalid ENS name" })
  ensName!: string;
}
