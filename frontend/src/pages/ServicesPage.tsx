import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Pencil, Trash2 } from 'lucide-react';
import { useGetAllServiceActivities, useDeleteServiceActivity } from '@/hooks/useQueries';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import ServiceActivityList from '@/components/services/ServiceActivityList';
import ServiceActivityForm from '@/components/services/ServiceActivityForm';
import { toast } from 'sonner';
import { extractCanisterError } from '@/utils/canisterError';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ActivityEntry } from '@/backend';

export default function ServicesPage() {
  const { data: activities = [], isLoading } = useGetAllServiceActivities(100, 0);
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const deleteMutation = useDeleteServiceActivity();

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!activityToDelete) return;

    try {
      await deleteMutation.mutateAsync(activityToDelete);
      toast.success('Service activity deleted successfully');
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = extractCanisterError(error);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (activity: ActivityEntry) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingActivity(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingActivity(undefined);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/40">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Our Services</h1>
            <p className="text-lg text-muted-foreground">
              See how your donations are making a real difference in the community
            </p>
          </div>
        </div>
      </section>

      {/* Services Content */}
      <section className="container py-12 space-y-8">
        {/* Admin Controls */}
        {isAdmin && !showForm && (
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Service Activity
            </Button>
          </div>
        )}

        {/* Form */}
        {showForm && isAdmin && (
          <ServiceActivityForm
            existingActivity={editingActivity}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {/* Activities List */}
        {!showForm && (
          <>
            {isLoading ? (
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading service activities...</p>
                </CardContent>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>No Service Activities Yet</CardTitle>
                  <CardDescription className="text-base">
                    {isAdmin
                      ? 'Click "Add Service Activity" above to create your first service entry with photos and details.'
                      : 'Our admin team will upload photos and details of service activities here. Check back soon to see how your donations are being used to help those in need.'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative">
                    <ServiceActivityList activities={[activity]} />
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setActivityToDelete(activity.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
