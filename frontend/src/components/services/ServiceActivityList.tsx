import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, Image as ImageIcon } from 'lucide-react';
import type { ActivityEntry } from '@/backend';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface ServiceActivityListProps {
  activities: ActivityEntry[];
  emptyMessage?: string;
}

export default function ServiceActivityList({ activities, emptyMessage }: ServiceActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage || 'No service activities yet'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <Card key={activity.id} className="border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl">{activity.title}</CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(activity.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {activity.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    {activity.images.length} {activity.images.length === 1 ? 'image' : 'images'}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Images Carousel */}
            {activity.images.length > 0 && (
              <div className="relative">
                {activity.images.length === 1 ? (
                  <img
                    src={activity.images[0].getDirectURL()}
                    alt={activity.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {activity.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={image.getDirectURL()}
                            alt={`${activity.title} - Image ${index + 1}`}
                            className="w-full h-64 md:h-96 object-cover rounded-lg"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
            </div>

            {/* Additional Notes */}
            {activity.notes && (
              <div className="space-y-2 pt-2 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Additional Notes
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{activity.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
