import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();

    // Calculate the start of the current week (Sunday 00:00:00)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. New clients registered in the current week (since Sunday)
    const newClientsCount = await this.prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: { gte: startOfWeek },
      },
    });

    // 2. Total Pending appointments (All time operational backlog)
    const uncompletedCount = await this.prisma.appointment.count({
      where: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    });

    // 3. Fetch data for trends (Based on creation and payment dates over the last 7 days)
    const weeklyAppointments = await this.prisma.appointment.findMany({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } }, // <-- Tracked when booking was requested
          { paidAt: { gte: sevenDaysAgo } },
        ],
      },
      select: {
        createdAt: true, // <-- CRITICAL: Fetch creation timestamp
        dateTime: true,
        paidAt: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    const weeklyRevenue = [];
    const weeklyStatusTrends = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let totalAppointmentsAskedInWindow = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const startMs = dayStart.getTime();
      const endMs = dayEnd.getTime();

      // --- REVENUE CALCULATION (Based on paidAt) ---
      const revenueAppts = weeklyAppointments.filter((a) => {
        if (!a.paidAt) return false;
        const paidMs = new Date(a.paidAt).getTime();
        return paidMs >= startMs && paidMs <= endMs;
      });

      const amount = revenueAppts.reduce(
        (sum, a) => sum + Number(a.totalAmount || 0),
        0,
      );

      weeklyRevenue.push({
        day: dayNames[d.getDay()],
        amount,
      });

      // --- STATUS TRENDS CALCULATION (Based on when they were ASKED / createdAt) ---
      const statusAppts = weeklyAppointments.filter((a) => {
        const createdMs = new Date(a.createdAt).getTime();
        return createdMs >= startMs && createdMs <= endMs;
      });

      // Keep running tally of total items asked in this 7-day period
      totalAppointmentsAskedInWindow += statusAppts.length;

      weeklyStatusTrends.push({
        day: dayNames[d.getDay()],
        asked: statusAppts.length, // <-- Shows total requested on this specific day
        completed: statusAppts.filter((a) => a.status === "COMPLETED").length,
        pending: statusAppts.filter(
          (a) => a.status !== "COMPLETED" && a.status !== "CANCELLED",
        ).length,
        cancelled: statusAppts.filter((a) => a.status === "CANCELLED").length,
      });
    }

    return {
      newClientsCount,
      weeklyAppointmentsCount: totalAppointmentsAskedInWindow, // <-- Now reflects total requested bookings
      uncompletedCount,
      weeklyRevenue,
      weeklyStatusTrends,
    };
  }

  async getUnfinishedAppointments(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          vehicle: {
            select: { id: true, make: true, model: true, licensePlate: true },
          },
          mechanic: { select: { id: true, name: true } },
        },
        orderBy: {
          dateTime: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
      }),
    ]);

    return {
      data: appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
