import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  TrendingUp,
  Users,
  CalendarCheck,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
} from "lucide-react";
import type { Appointment } from "../../types";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

export default function HomeDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newClientsCount: 0,
    weeklyAppointmentsCount: 0,
    uncompletedCount: 0,
    weeklyRevenue: [] as { day: string; amount: number }[],
    weeklyStatusTrends: [] as {
      day: string;
      completed: number;
      pending: number;
      cancelled: number;
    }[],
  });

  const [unfinishedAppointments, setUnfinishedAppointments] = useState<
    Appointment[]
  >([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        type: "bar",
        stacked: false,
        height: 350,
        fontFamily: "inherit",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
        },
      },
      dataLabels: { enabled: false },
      colors: ["#10b981", "#f59e0b", "#ef4444"], // Completed, Pending, Cancelled
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories:
          stats.weeklyStatusTrends.length > 0
            ? stats.weeklyStatusTrends.map((t) => t.day)
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        labels: {
          style: {
            colors: "#a1a1aa",
            fontSize: "10px",
            fontWeight: 700,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#a1a1aa",
            fontSize: "12px",
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        labels: {
          colors: "#a1a1aa",
        },
      },
      tooltip: {
        theme: "dark",
      },
    }),
    [stats.weeklyStatusTrends],
  );

  const chartSeries = useMemo(
    () => [
      {
        name: "Completed",
        data:
          stats.weeklyStatusTrends.length > 0
            ? stats.weeklyStatusTrends.map((t) => t.completed)
            : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Pending",
        data:
          stats.weeklyStatusTrends.length > 0
            ? stats.weeklyStatusTrends.map((t) => t.pending)
            : [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Cancelled",
        data:
          stats.weeklyStatusTrends.length > 0
            ? stats.weeklyStatusTrends.map((t) => t.cancelled)
            : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
    [stats.weeklyStatusTrends],
  );

  const loadStats = async () => {
    try {
      const { data } = await api.get("/api/dashboard/stats");
      console.log("dashboard stats:", data);
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnfinishedAppointments = async (page = 1) => {
    setAppointmentsLoading(true);
    try {
      const { data } = await api.get(
        `/api/dashboard/unfinished-appointments?page=${page}&limit=10`,
      );
      setUnfinishedAppointments(data.data);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to load unfinished appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUnfinishedAppointments();
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadUnfinishedAppointments(page);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-violet-600 dark:text-gold-500 mb-6"
        >
          <Clock size={48} />
        </motion.div>
        <p className="text-violet-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  console.log("stats is:", stats);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="bg-violet-600 dark:bg-gold-500 p-5 rounded-[32px] text-white dark:text-violet-950 shadow-2xl shadow-violet-500/20 dark:shadow-gold-500/30 transition-transform hover:scale-110 duration-500">
            <ClipboardList size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-violet-950 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <div className="mt-2 bg-violet-50 dark:bg-violet-800 px-4 py-2 rounded-2xl border border-violet-100 dark:border-violet-700 inline-block shadow-inner">
              <p className="text-violet-500 dark:text-white font-bold text-sm tracking-wide uppercase tracking-[0.2em]">
                Operations Overview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
        {/* New Clients */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-violet-500" />
              <h3 className="text-xl font-black text-violet-950 dark:text-white">
                New Clients
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                Weekly
              </span>
            </div>
          </div>
          <p className="text-5xl font-black text-violet-950 dark:text-white mb-2">
            {stats.newClientsCount}
          </p>
          <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
            Registered this week
          </p>
        </motion.div>

        {/* Weekly Appointments */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarCheck size={24} className="text-violet-500" />
              <h3 className="text-xl font-black text-violet-950 dark:text-white">
                Appointments
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                Weekly
              </span>
            </div>
          </div>
          <p className="text-5xl font-black text-violet-950 dark:text-white mb-2">
            {stats.weeklyAppointmentsCount}
          </p>
          <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
            Scheduled in last 7 days
          </p>
        </motion.div>

        {/* Uncompleted Appointments */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-amber-500" />
              <h3 className="text-xl font-black text-violet-950 dark:text-white">
                Pending
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-amber-500" />
              <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                Weekly
              </span>
            </div>
          </div>
          <p className="text-5xl font-black text-violet-950 dark:text-white mb-2">
            {stats.uncompletedCount}
          </p>
          <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
            Not completed/cancelled
          </p>
        </motion.div>

        {/* Weekly Revenue */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-green-500" />
              <h3 className="text-xl font-black text-violet-950 dark:text-white">
                Revenue
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                Weekly
              </span>
            </div>
          </div>
          <p className="text-5xl font-black text-violet-950 dark:text-white mb-2">
            {stats.weeklyRevenue.length > 0 ? "$" : ""}
            {stats.weeklyRevenue
              .reduce((sum, day) => sum + day.amount, 0)
              .toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
            Completed & paid appointments
          </p>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10 mb-16"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-violet-950 dark:text-white">
            Service Efficiency Trend
          </h2>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-violet-500" />
            <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
              Last 7 Days
            </span>
          </div>
        </div>

        {!loading && (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={350}
          />
        )}
      </motion.div>

      {/* Unfinished Appointments Table */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl shadow-violet-500/10 dark:shadow-gold-500/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-violet-500" />
            <h2 className="text-2xl font-black text-violet-950 dark:text-white">
              Pending Appointments
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-amber-500" />
            <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase">
              Sorted by newest first
            </span>
          </div>
        </div>

        {appointmentsLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-violet-600 dark:text-gold-500 mb-4"
            >
              <Clock size={32} />
            </motion.div>
            <p className="text-violet-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">
              Loading appointments...
            </p>
          </div>
        ) : (
          <>
            {unfinishedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-violet-50 dark:bg-violet-950/50 p-8 rounded-2xl border border-violet-100 dark:border-violet-700"
                >
                  <AlertTriangle size={48} className="mb-4 text-amber-500" />
                  <p className="text-xl font-black text-violet-950 dark:text-white mb-2">
                    No pending appointments
                  </p>
                  <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 tracking-widest uppercase text-center">
                    All appointments are completed or cancelled
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-violet-100 dark:border-violet-700">
                  <thead>
                    <tr className="bg-violet-50 dark:bg-violet-950/50">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Appointment ID
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Vehicle
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-100 dark:border-violet-700">
                    <AnimatePresence mode="popLayout">
                      {unfinishedAppointments.map((appointment) => (
                        <motion.tr
                          key={appointment.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="bg-violet-100 dark:bg-violet-950/20 text-violet-600 dark:text-gold-400 rounded-full px-3 py-1 text-xs font-black">
                                #{appointment.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center font-black text-violet-600">
                                  {appointment.client?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-violet-950 dark:text-white">
                                  {appointment.client?.name}
                                </p>
                                <p className="text-[8px] text-violet-500 dark:text-gold-400">
                                  {appointment.client?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center font-black text-gold-500">
                                  {appointment.vehicle?.make?.charAt(0) || "?"}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-violet-950 dark:text-white">
                                  {appointment.vehicle?.make}{" "}
                                  {appointment.vehicle?.model}
                                </p>
                                <p className="text-[8px] text-violet-500 dark:text-gold-400">
                                  {appointment.vehicle?.licensePlate}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-[10px] font-black text-violet-950 dark:text-white">
                              {new Date(
                                appointment.dateTime,
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-[8px] text-violet-500 dark:text-gold-400">
                              {new Date(
                                appointment.dateTime,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-[8px] font-black ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={() =>
                                  navigate(`/admin/appointments/${appointment.id}`)
                                }
                                className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/50 text-[8px] font-black text-violet-600 dark:text-gold-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/80 transition-colors flex items-center gap-1"
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/appointments/${appointment.id}`)
                                }
                                className="px-3 py-1.5 bg-violet-100 dark:bg-violet-950/20 text-[8px] font-black text-violet-600 dark:text-gold-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800/30 transition-colors flex items-center gap-1"
                              >
                                <Edit size={12} /> Edit
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {unfinishedAppointments.length > 0 && (
              <div className="mt-6 flex items-center justify-between px-6 pt-4 border-t border-violet-100 dark:border-violet-700">
                <div className="flex items-center space-x-3 text-[9px] font-black text-violet-600 dark:text-gold-400">
                  <span>
                    Showing {unfinishedAppointments.length} of{" "}
                    {totalPages * 10 || 0} appointments
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-3 py-2 rounded-lg font-black text-[9px] ${
                      currentPage <= 1
                        ? "bg-violet-50 dark:bg-violet-950/50 text-violet-400 dark:text-gold-400/50 cursor-not-allowed"
                        : "bg-violet-100 dark:bg-violet-950/20 hover:bg-violet-200 dark:hover:bg-violet-800/30 transition-colors"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[9px] font-black text-violet-600 dark:text-gold-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-2 rounded-lg font-black text-[9px] ${
                      currentPage >= totalPages
                        ? "bg-violet-50 dark:bg-violet-950/50 text-violet-400 dark:text-gold-400/50 cursor-not-allowed"
                        : "bg-violet-100 dark:bg-violet-950/20 hover:bg-violet-200 dark:hover:bg-violet-800/30 transition-colors"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Helper function to get status color classes
function getStatusColor(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-500/20 text-blue-500";
    case "CONFIRMED":
      return "bg-violet-500/20 text-violet-500";
    case "IN_PROGRESS":
      return "bg-amber-500/20 text-amber-500";
    case "COMPLETED":
      return "bg-green-500/20 text-green-500";
    case "CANCELLED":
    case "CANCEL_REQUESTED":
      return "bg-red-500/20 text-red-500";
    default:
      return "bg-gray-500/20 text-gray-500";
  }
}
