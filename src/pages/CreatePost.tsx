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
  ArrowLeft,
  Clock,
  Globe,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    try {
      // Validate content
      if (!data.content || !data.content.trim()) {
        toast.error('Content is required');
        return;
      }

      const postData = {
        content: data.content.trim(),
        image: uploadedImage || undefined,
        scheduledFor: data.scheduleTime || undefined,
        linkUrl: undefined, // You can add linkUrl support later if needed
      };

      console.log('About to send postData:', postData);
      const response = await postsAPI.createPost(postData);
      console.log('Received response:', response);
      
      const newPost = {
        id: Date.now().toString(),
        content: data.content,
        status: response?.linkedin_response ? 'success' as const : 'pending' as const,
        createdAt: new Date().toISOString(),
        scheduledAt: data.scheduleTime,
      };

      addPost(newPost);
      toast.success('Post created and published to LinkedIn successfully!');
      reset();
      setUploadedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Error creating post:', error);
      console.error('Full error object:', error.response || error);
      
      // Show more detailed error message
      let errorMessage = 'Failed to create post';
      
      if (error.response?.data) {
        const data = error.response.data;
        console.error('Detailed error response:', data);
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="space-y-6 p-4">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Create Post
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      Craft and schedule your professional LinkedIn content with AI assistance.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreview(!preview)}
                  className="group border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-200"
                >
                  <Eye className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  {preview ? 'Edit Mode' : 'Preview Mode'}
                </Button>
                <Badge 
                  variant={isLoggedIn ? 'default' : 'secondary'} 
                  className={`capitalize font-semibold text-xs px-3 py-1 ${isLoggedIn ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}
                >
                  {isLoggedIn ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2 w-2" />
                      <span>LinkedIn Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-2 w-2" />
                      <span>Not Connected</span>
                    </div>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Connection Alert */}
        {!isLoggedIn && (
          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                    LinkedIn Connection Required
                  </h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Please connect to LinkedIn in the vault to start creating and posting content.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/linkedin-vault')}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-orange-500/25 transition-all duration-200"
                >
                  Connect Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Enhanced Form Card */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-200/20 dark:border-indigo-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Post Content</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Create engaging content for LinkedIn</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Enhanced AI Toggle */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="ai-toggle" className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                          AI Content Generation
                        </Label>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Generate professional content with AI assistance
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="ai-toggle"
                      checked={useAI}
                      onCheckedChange={(checked) => setValue('useAI', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-violet-600"
                    />
                  </div>

                  {useAI && (
                    <div className="mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateAIContent}
                        className="w-full group border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-200"
                      >
                        <Zap className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                        Generate AI Content
                      </Button>
                    </div>
                  )}
                </div>

                {/* Enhanced Content Area */}
                <div className="space-y-3">
                  <Label htmlFor="content" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Content *
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      placeholder="What's happening in your professional world? Share insights, updates, or thoughts that resonate with your network..."
                      className="min-h-32 resize-none bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 transition-all duration-200"
                      {...register('content')}
                    />
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-2 text-xs bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                        <Globe className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Public</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        (content?.length || 0) > 2500 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : (content?.length || 0) > 2800 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {content?.length || 0} / 3000
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">characters</span>
                    </div>
                    {errors.content && (
                      <span className="text-red-600 dark:text-red-400 font-medium text-xs">
                        {errors.content.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Image Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Media (Optional)
                  </Label>
                  {!uploadedImage ? (
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 scale-105'
                          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-3">
                        <div className="mx-auto w-fit p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl">
                          <ImageIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {isDragActive
                              ? 'Drop your image here...'
                              : 'Add visual content to your post'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Drag & drop or click to upload • PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={imagePreview!}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl"></div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Enhanced Schedule */}
                <div className="space-y-3">
                  <Label htmlFor="schedule" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Post (Optional)
                  </Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    {...register('scheduleTime')}
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 transition-all duration-200"
                  />
                </div>

                {/* Enhanced Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 group"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Post...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        {watch('scheduleTime') ? 'Schedule Post' : 'Publish Now'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Preview Card */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/30 dark:to-cyan-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-teal-200/20 dark:border-teal-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Live Preview</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">See how your post will appear</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                {/* Mock LinkedIn Post */}
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">YN</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Your Name</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        You
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Senior Professional • 1st</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{watch('scheduleTime') ? 'Scheduled' : 'Now'}</span>
                      <Globe className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {content ? (
                    <div className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                      {content}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                      Your post content will appear here as you type...
                    </div>
                  )}

                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Post preview"
                        className="w-full rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex space-x-6 text-xs text-slate-500 dark:text-slate-400">
                    <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <span>👍</span> Like
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <span>💬</span> Comment
                    </button>
                    <button className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                      <span>🔄</span> Repost
                    </button>
                    <button className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <span>📤</span> Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">Reach</div>
                  <div className="text-sm font-bold text-blue-800 dark:text-blue-300">~2.5K</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Engagement</div>
                  <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">~3.2%</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-400">Impressions</div>
                  <div className="text-sm font-bold text-purple-800 dark:text-purple-300">~4.1K</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}