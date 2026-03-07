import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDepartments } from '@/hooks/useDepartments';
import { useSubscriptions, useSubscribeToDepartment, useUnsubscribeFromDepartment } from '@/hooks/useSubscriptions';
import { cn } from '@/lib/utils';

export function DepartmentSubscriptions() {
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { subscriptions, isLoading: loadingSubs } = useSubscriptions();
  const subscribeMutation = useSubscribeToDepartment();
  const unsubscribeMutation = useUnsubscribeFromDepartment();

  const isSubscribed = (departmentId: string) => {
    return subscriptions.some(sub => sub.department_id === departmentId);
  };

  const handleToggleSubscription = (departmentId: string) => {
    if (isSubscribed(departmentId)) {
      unsubscribeMutation.mutate(departmentId);
    } else {
      subscribeMutation.mutate(departmentId);
    }
  };

  const isLoading = loadingDepts || loadingSubs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Department Subscriptions
        </CardTitle>
        <CardDescription>
          Follow departments to get notified about new notices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((department) => {
            const subscribed = isSubscribed(department.id);
            const isPending =
              (subscribeMutation.isPending || unsubscribeMutation.isPending) &&
              (subscribeMutation.variables === department.id || unsubscribeMutation.variables === department.id);

            return (
              <div
                key={department.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4",
                  subscribed ? "border-primary/40 bg-primary/5 shadow-sm" : "bg-card hover:border-primary/20 hover:bg-muted/30"
                )}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <h4 className="font-semibold text-sm sm:text-base truncate text-foreground/90">
                    {department.name}
                  </h4>
                  {subscribed && (
                    <Badge variant="secondary" className="mt-1.5 text-[10px] sm:text-xs font-medium bg-primary/10 text-primary border-none">
                      Following
                    </Badge>
                  )}
                </div>
                <Button
                  variant={subscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleToggleSubscription(department.id)}
                  disabled={isPending}
                  className={cn(
                    "shrink-0 h-9 transition-all duration-200",
                    subscribed ? "border-primary/20 hover:bg-primary/5" : "shadow-md hover:shadow-lg active:scale-95"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : subscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-1.5" />
                      <span className="text-xs sm:text-sm">Unfollow</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1.5" />
                      <span className="text-xs sm:text-sm">Follow</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {(!departments || departments.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            No departments available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
