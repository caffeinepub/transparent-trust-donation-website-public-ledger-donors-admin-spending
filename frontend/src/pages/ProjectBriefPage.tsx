import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

export default function ProjectBriefPage() {
  const [briefText, setBriefText] = useLocalStorageState('project-brief', '');
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!briefText.trim()) {
      toast.error('Nothing to copy', {
        description: 'Please enter some text in the brief first.',
      });
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(briefText);
      toast.success('Copied to clipboard', {
        description: 'Your project brief has been copied successfully.',
      });
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try again or copy manually.',
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleExportAsText = () => {
    if (!briefText.trim()) {
      toast.error('Nothing to export', {
        description: 'Please enter some text in the brief first.',
      });
      return;
    }

    try {
      const blob = new Blob([briefText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-brief-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Brief exported', {
        description: 'Your project brief has been downloaded as a text file.',
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again.',
      });
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Project Brief
        </h1>
        <p className="text-muted-foreground">
          Document your website summary and requirements. Your text is automatically saved in your browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Summary</CardTitle>
          <CardDescription>
            Enter a comprehensive summary of your website, including features, goals, and any specific requirements.
            Your work is saved automatically as you type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            placeholder="Start typing your project brief here...

Example:
- Website purpose and goals
- Target audience
- Key features and functionality
- Design preferences
- Technical requirements
- Timeline and milestones"
            className="min-h-[400px] font-mono text-sm"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopyToClipboard}
              disabled={isCopying || !briefText.trim()}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {isCopying ? 'Copying...' : 'Copy to Clipboard'}
            </Button>
            
            <Button
              onClick={handleExportAsText}
              variant="outline"
              disabled={!briefText.trim()}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as Text File
            </Button>
          </div>

          {briefText.trim() && (
            <div className="text-sm text-muted-foreground">
              Character count: {briefText.length.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2 text-sm">💡 Tips for a Great Project Brief</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Be specific about your goals and target audience</li>
          <li>List all required features and functionality</li>
          <li>Include design preferences and brand guidelines</li>
          <li>Mention any technical constraints or requirements</li>
          <li>Your brief is saved locally in your browser and persists across sessions</li>
        </ul>
      </div>
    </div>
  );
}
