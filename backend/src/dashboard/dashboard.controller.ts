import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get("unfinished-appointments")
  getUnfinishedAppointments(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    return this.dashboardService.getUnfinishedAppointments(+page, +limit);
  }
}
