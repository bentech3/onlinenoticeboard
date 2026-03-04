import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDepartments } from '@/hooks/useDepartments';
import { useSubscriptions, useSubscribeToDepartment, useUnsubscribeFromDepartment } from '@/hooks/useSubscriptions';

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
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                  subscribed ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{department.name}</h4>
                  {subscribed && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Following
                    </Badge>
                  )}
                </div>
                <Button
                  variant={subscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleToggleSubscription(department.id)}
                  disabled={isPending}
                  className="ml-2 shrink-0"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : subscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-1" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1" />
                      Follow
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
