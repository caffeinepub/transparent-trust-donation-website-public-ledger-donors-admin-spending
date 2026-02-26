import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddServiceActivity, useUpdateServiceActivity } from '@/hooks/useQueries';
import { ExternalBlob, type ActivityEntry } from '@/backend';
import { fileToUint8Array } from '@/utils/fileToUint8Array';
import { extractCanisterError } from '@/utils/canisterError';

interface ServiceActivityFormProps {
  existingActivity?: ActivityEntry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceActivityForm({ existingActivity, onSuccess, onCancel }: ServiceActivityFormProps) {
  const addMutation = useAddServiceActivity();
  const updateMutation = useUpdateServiceActivity();

  const [title, setTitle] = useState(existingActivity?.title || '');
  const [description, setDescription] = useState(existingActivity?.description || '');
  const [notes, setNotes] = useState(existingActivity?.notes || '');
  const [author, setAuthor] = useState(existingActivity?.author || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!existingActivity;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Only image files are allowed');
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!author.trim()) {
      newErrors.author = 'Author name is required';
    }

    if (!isEditing && selectedFiles.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      let imageBlobs: ExternalBlob[] = [];

      // If editing and no new files selected, keep existing images
      if (isEditing && selectedFiles.length === 0 && existingActivity) {
        imageBlobs = existingActivity.images;
      } else if (selectedFiles.length > 0) {
        // Upload new images
        imageBlobs = await Promise.all(
          selectedFiles.map(async (file, index) => {
            const bytes = await fileToUint8Array(file);
            // Cast to the expected type to satisfy TypeScript
            const blob = ExternalBlob.fromBytes(bytes as Uint8Array<ArrayBuffer>).withUploadProgress((percentage) => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percentage,
              }));
            });
            return blob;
          })
        );
      }

      const data = {
        title: title.trim(),
        description: description.trim(),
        images: imageBlobs,
        author: author.trim(),
        notes: notes.trim() || null,
      };

      if (isEditing && existingActivity) {
        await updateMutation.mutateAsync({
          id: existingActivity.id,
          ...data,
        });
        toast.success('Service activity updated successfully');
      } else {
        await addMutation.mutateAsync(data);
        toast.success('Service activity created successfully');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setNotes('');
      setAuthor('');
      setSelectedFiles([]);
      setUploadProgress({});
      setErrors({});

      onSuccess?.();
    } catch (error) {
      console.error('Service activity submission error:', error);
      const errorMessage = extractCanisterError(error);
      toast.error(errorMessage);
    }
  };

  const isSubmitting = addMutation.isPending || updateMutation.isPending;
  const hasUploadProgress = Object.keys(uploadProgress).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Service Activity' : 'Add New Service Activity'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the service activity details' : 'Create a new service activity with images and details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Food Distribution at Local Shelter"
              required
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">
              Author/Organizer <span className="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name or organization"
              required
            />
            {errors.author && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.author}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service activity, location, date, and impact..."
              rows={4}
              required
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information, funds used, number of people helped, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">
              Images {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <div className="space-y-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {errors.images && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.images}
                </p>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium">Selected Images ({selectedFiles.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {uploadProgress[file.name] !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                          {uploadProgress[file.name]}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isEditing && existingActivity && selectedFiles.length === 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium">Current Images ({existingActivity.images.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {existingActivity.images.map((blob, index) => (
                    <img
                      key={index}
                      src={blob.getDirectURL()}
                      alt={`Current ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload new images to replace these
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || hasUploadProgress}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Activity' : 'Create Activity'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
