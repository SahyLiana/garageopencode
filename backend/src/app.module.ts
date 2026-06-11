import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { CommentsModule } from "./comments/comments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { InventoryModule } from "./inventory/inventory.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    AppointmentsModule,
    CommentsModule,
    PrismaModule,
    DashboardModule,
    InventoryModule,
    NotificationsModule,
  ],
})
export class AppModule {}
