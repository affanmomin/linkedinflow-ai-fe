import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Send,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { linkedInAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(3000, 'Content must be under 3000 characters'),
  scheduleTime: z.string().optional(),
  useAI: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePost() {
  const [preview, setPreview] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { addPost, isLoggedIn } = useLinkedInStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const content = watch('content');
  const useAI = watch('useAI');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const generateAIContent = async () => {
    // Simulated AI content generation
    const aiSuggestions = [
      "🚀 Excited to share our latest innovation in the LinkedIn automation space! The future of professional networking is here.",
      "💡 Just finished an amazing project that combines AI and social media automation. Can't wait to see the impact!",
      "🎯 Professional tip: Consistency in your LinkedIn posting can increase your reach by up to 300%. Here's how we're making it easier...",
    ];
    
    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setValue('content', randomSuggestion);
    toast.success('AI content generated!');
  };

  const onSubmit = async (data: PostFormData) => {
    if (!isLoggedIn) {
      toast.error('Please connect to LinkedIn first');
      return;
    }

    try {
      const postData = {
        content: data.content,
        image: uploadedImage || undefined,
        scheduleTime: data.scheduleTime || undefined,
      };

      const response = await linkedInAPI.createAndPost(postData);
      
      const newPost = {
        id: Date.now().toString(),
        content: data.content,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        scheduledAt: data.scheduleTime,
      };

      addPost(newPost);
      toast.success('Post created successfully!');
      reset();
      setUploadedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600">Create and schedule your LinkedIn content</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* LinkedIn Status */}
      {!isLoggedIn && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-orange-800">
                Please connect to LinkedIn in the vault to start posting
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Post Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* AI Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="ai-toggle">AI Content Generation</Label>
                </div>
                <Switch
                  id="ai-toggle"
                  checked={useAI}
                  onCheckedChange={(checked) => setValue('useAI', checked)}
                />
              </div>

              {useAI && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateAIContent}
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Content
                </Button>
              )}

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? Share your professional insights..."
                  className="min-h-32 resize-none"
                  {...register('content')}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{content?.length || 0} / 3000 characters</span>
                  {errors.content && (
                    <span className="text-red-500">{errors.content.message}</span>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image (Optional)</Label>
                {!uploadedImage ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? 'Drop the image here...'
                        : 'Drag & drop an image, or click to select'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview!}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  {...register('scheduleTime')}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || !isLoggedIn}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  'Creating...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Post
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              {/* Mock LinkedIn Post */}
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">Your Name</span>
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">Professional Title</p>
                  <p className="text-xs text-gray-400">Now</p>
                </div>
              </div>

              <div className="mt-4">
                {content ? (
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{content}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Your post content will appear here...
                  </p>
                )}

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Post preview"
                    className="mt-3 w-full rounded-lg max-h-64 object-cover"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔄 Repost</span>
                  <span>📤 Send</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}