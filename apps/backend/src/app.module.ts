import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import configuration from "./config/configuration";
import { AuthModule } from "./modules/auth/auth.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { EnsModule } from "./modules/ens/ens.module";
import { FeedModule } from "./modules/feed/feed.module";
import { PaymentLinksModule } from "./modules/payment-links/payment-links.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { QrCodesModule } from "./modules/qr-codes/qr-codes.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { UnilinkModule } from "./modules/unilink/unilink.module";
import { UsersModule } from "./modules/users/users.module";

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
    UsersModule,
    EnsModule,
    PaymentsModule,
    TransactionsModule,
    FeedModule,
    QrCodesModule,
    PaymentLinksModule,
    ContactsModule,
    UnilinkModule
  ]
})
export class AppModule {}
