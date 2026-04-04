import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import configuration from "./config/configuration";
import { AuthModule } from "./modules/auth/auth.module";
import { EnsModule } from "./modules/ens/ens.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

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
    PrismaModule,
    AuthModule,
    UsersModule,
    EnsModule,
    PaymentsModule,
    TransactionsModule
  ]
})
export class AppModule {}
