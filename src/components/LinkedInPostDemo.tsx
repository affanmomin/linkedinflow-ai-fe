import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useLinkedInOAuth } from '../hooks/useLinkedInOAuth';
import { linkedInAPI } from '../lib/api';

export function LinkedInPostDemo() {
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  const { isConnected, oauthData, tokenRevoked, lastError } = useLinkedInOAuth();

  const handleCreatePost = async () => {
    if (!isConnected) {
      toast.error('Please connect to LinkedIn first');
      return;
    }

    if (!postContent.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    try {
      setIsPosting(true);
      
      // Use the existing createAndPost API (this would need to be updated in your backend)
      const response = await linkedInAPI.createAndPost({
        content: postContent.trim()
      });

      if (response.success) {
        toast.success('Post created successfully!');
        setPostContent('');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Check if this is a token revocation error
      if (error instanceof Error && error.message.includes('revoked')) {
        toast.error('LinkedIn access was revoked. Please reconnect your account.');
        // Optionally redirect to LinkedIn Vault
        setTimeout(() => {
          window.location.href = '/linkedin-vault';
        }, 2000);
      } else {
        toast.error('Failed to create post');
      }
    } finally {
      setIsPosting(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              {tokenRevoked ? "LinkedIn Access Revoked" : "LinkedIn Not Connected"}
            </h2>
            <p className="text-gray-600 mb-4">
              {tokenRevoked 
                ? "Your LinkedIn access was revoked. Please reconnect your account to create posts."
                : "Please connect your LinkedIn account first to create posts."
              }
            </p>
            {tokenRevoked && lastError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Error: {lastError}
              </div>
            )}
            <Button 
              onClick={() => window.location.href = '/linkedin-vault'} 
              className="bg-[#0A66C2] hover:bg-[#004182]"
            >
              {tokenRevoked ? "Reconnect LinkedIn" : "Go to LinkedIn Vault"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create LinkedIn Post</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium mb-2">
                Post Content
              </label>
              <Textarea
                id="post-content"
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Connected as: {oauthData?.userProfile?.vanityName || 'LinkedIn User'}
              </div>
              
              <Button 
                onClick={handleCreatePost}
                disabled={isPosting || !postContent.trim()}
                className="bg-[#0A66C2] hover:bg-[#004182]"
              >
                {isPosting ? 'Posting...' : 'Create Post'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">OAuth Integration Info</h3>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {oauthData?.userProfile?.vanityName || 'LinkedIn User'}</div>
            <div><strong>Connected:</strong> {oauthData?.connectedAt ? new Date(oauthData.connectedAt).toLocaleString() : 'Unknown'}</div>
            <div><strong>Status:</strong> <span className="text-green-600">Connected</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LinkedInPostDemo;