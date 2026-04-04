import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

@Injectable()
export class EnsService {
  private readonly client;

  constructor(private readonly configService: ConfigService) {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http(this.configService.get<string>("ethereumRpcUrl"))
    });
  }

  async resolveName(ensName: string) {
    const address = await this.client.getEnsAddress({ name: ensName });
    return { ensName, address };
  }
}
