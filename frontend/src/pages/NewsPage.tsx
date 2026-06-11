import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

type Notification = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  relatedEntityId: string | null;
  createdAt: string;
};

type PaginatedResponse = {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const NewsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuthStore();
  const { decrementUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (p: number) => {
    try {
      const res = await api.get<PaginatedResponse>(`/api/notifications?page=${p}&limit=10`);
      setNotifications(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications(page);
  }, [user, navigate, page, fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      decrementUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    const appointmentId = notification.relatedEntityId;
    if (user?.role === 'ADMIN') {
      navigate(appointmentId ? `/admin/appointments/${appointmentId}` : '/admin/appointments');
    } else if (user?.role === 'MECHANIC') {
      if (appointmentId) {
        setSelectedAppointmentId(parseInt(appointmentId));
      }
      navigate('/mechanic/appointments');
    } else {
      navigate('/client/appointments');
    }
  };

  const getActionLabel = (type: string) => {
    if (user?.role === 'ADMIN') {
      if (type === 'PART_REQUESTED') return 'Review Request';
      return 'View';
    }
    return 'View';
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      APPOINTMENT_CREATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      PART_REQUESTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      PART_APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      MECHANIC_ASSIGNED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      STATUS_UPDATED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    };
    const label = type.replace(/_/g, ' ');
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-violet-950 dark:text-white">News</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{total} notification{total !== 1 ? 's' : ''}</span>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-4 opacity-30">📭</div>
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.isRead ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(notification.type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {notification.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleAction(notification)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          notification.type === 'PART_REQUESTED' && user?.role === 'ADMIN'
                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200 dark:shadow-amber-900/30'
                            : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                        }`}
                      >
                        {getActionLabel(notification.type)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-gray-700 text-sm font-bold disabled:opacity-40 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-gray-700 text-sm font-bold disabled:opacity-40 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;