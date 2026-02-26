import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Sparkles } from 'lucide-react';
import { useRecordProverbFeedback } from '@/hooks/useQueries';
import { extractCanisterError } from '@/utils/canisterError';
import { toast } from 'sonner';

interface ProverbFeedbackPromptProps {
  donationId: string;
  proverb: { id: string; text: string; author: string };
}

export default function ProverbFeedbackPrompt({ donationId, proverb }: ProverbFeedbackPromptProps) {
  const [submitted, setSubmitted] = useState(false);
  const recordFeedback = useRecordProverbFeedback();

  const handleFeedback = async (isLiked: boolean) => {
    try {
      await recordFeedback.mutateAsync({ donationId, isLiked });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      const errorMessage = extractCanisterError(error);
      toast.error(errorMessage || 'Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">Thank you for your feedback!</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your response has been recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          A Special Message for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-3">
          <p className="text-lg italic text-foreground leading-relaxed">
            "{proverb.text}"
          </p>
          <p className="text-sm text-muted-foreground">— {proverb.author}</p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Did you like this message?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => handleFeedback(true)}
              disabled={recordFeedback.isPending}
              variant="default"
              className="flex-1 max-w-[200px]"
            >
              <Heart className="mr-2 h-4 w-4" />
              I Like it
            </Button>
            <Button
              onClick={() => handleFeedback(false)}
              disabled={recordFeedback.isPending}
              variant="outline"
              className="flex-1 max-w-[200px]"
            >
              <HeartOff className="mr-2 h-4 w-4" />
              I don't like it
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
