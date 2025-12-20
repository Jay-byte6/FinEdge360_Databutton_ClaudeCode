import { useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import usePortfolioStore from '@/utils/portfolioStore';
import useAuthStore from '@/utils/authStore';

export const NotificationCenter = () => {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = usePortfolioStore();

  useEffect(() => {
    if (user?.id) {
      // Initial fetch
      fetchNotifications(user.id);

      // Refresh every 5 minutes
      const interval = setInterval(() => {
        fetchNotifications(user.id);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user?.id, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    if (user?.id) {
      fetchNotifications(user.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'GAIN_10_PERCENT') {
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    }
    if (type === 'LOSS_10_PERCENT') {
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    }
    return <Bell className="h-5 w-5 text-blue-600" />;
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    if (type === 'GAIN_10_PERCENT') return 'bg-green-50 border-green-200';
    if (type === 'LOSS_10_PERCENT') return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4 flex items-center justify-between">
          <h4 className="font-semibold text-lg">Portfolio Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                You'll be notified when your portfolio changes by 10%+
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors hover:bg-gray-50 ${getNotificationBgColor(notif.notification_type, notif.is_read)} border-l-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notif.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`font-medium text-sm ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{notif.message}</p>
                      {notif.scheme_name && (
                        <p className="text-xs text-gray-500 truncate mb-1" title={notif.scheme_name}>
                          {notif.scheme_name}
                        </p>
                      )}
                      {notif.change_percentage !== null && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={notif.change_percentage >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {notif.change_percentage >= 0 ? '+' : ''}{notif.change_percentage.toFixed(2)}%
                          </span>
                          {notif.old_value !== null && notif.new_value !== null && (
                            <span className="text-gray-500">
                              ₹{(notif.old_value / 1000).toFixed(0)}k → ₹{(notif.new_value / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{formatDate(notif.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
