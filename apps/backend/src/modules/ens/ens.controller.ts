import { Body, Controller, Post } from "@nestjs/common";

import { ResolveEnsDto } from "./dto/resolve-ens.dto";
import { EnsService } from "./ens.service";

@Controller("ens")
export class EnsController {
  constructor(private readonly ensService: EnsService) {}

  @Post("resolve")
  resolve(@Body() payload: ResolveEnsDto) {
    return this.ensService.resolveName(payload.ensName);
  }
}
