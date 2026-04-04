import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import configuration from "./config/configuration";
import { AuthModule } from "./modules/auth/auth.module";
import { EnsModule } from "./modules/ens/ens.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>("rateLimit.ttl", 60) * 1000,
          limit: config.get<number>("rateLimit.limit", 20)
        }
      ]
    }),
    AuthModule,
    EnsModule
  ]
})
export class AppModule {}
