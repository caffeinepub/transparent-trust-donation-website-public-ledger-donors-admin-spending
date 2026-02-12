import { useState } from 'react';
import { useGetAdminNotifications, useGetUnreadNotificationCount, useMarkNotificationAsRead, useAcknowledgeNotification } from '@/hooks/useQueries';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, X, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Notification } from '@/backend';

export default function AdminNotifications() {
  const { isAdmin } = useAdminStatus();
  const [open, setOpen] = useState(false);
  
  const { data: unreadCount } = useGetUnreadNotificationCount(isAdmin);
  const { data: notifications = [], isLoading } = useGetAdminNotifications(20, isAdmin);
  const markAsRead = useMarkNotificationAsRead();
  const acknowledge = useAcknowledgeNotification();

  const unreadCountNumber = unreadCount ? Number(unreadCount) : 0;

  const handleMarkAsRead = async (notificationId: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleAcknowledge = async (notificationId: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await acknowledge.mutateAsync(notificationId);
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'normal':
        return 'text-primary';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const getPriorityIcon = (priority: Notification['priority']) => {
    if (priority === 'high') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Bell className="h-4 w-4" />;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCountNumber > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCountNumber > 9 ? '9+' : unreadCountNumber}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCountNumber > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCountNumber} new
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when your partner records spending
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id.toString()}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    notification.isNew ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(Number(notification.timestamp) / 1_000_000, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.isNew && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          disabled={markAsRead.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleAcknowledge(notification.id, e)}
                        disabled={acknowledge.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
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
}
