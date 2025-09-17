import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';

export function Dashboard() {
  const { posts, isLoggedIn, batchProgress } = useLinkedInStore();
  const { sheetConnection } = useDataStore();

  const recentPosts = posts.slice(0, 5);
  const successfulPosts = posts.filter(post => post.status === 'success').length;
  const failedPosts = posts.filter(post => post.status === 'failed').length;
  const pendingPosts = posts.filter(post => post.status === 'pending').length;

  const stats = [
    {
      title: 'Total Posts',
      value: posts.length,
      icon: MessageSquare,
      trend: '+12%',
      color: 'bg-blue-500',
    },
    {
      title: 'Success Rate',
      value: posts.length > 0 ? `${Math.round((successfulPosts / posts.length) * 100)}%` : '0%',
      icon: TrendingUp,
      trend: '+5%',
      color: 'bg-green-500',
    },
    {
      title: 'Engagement',
      value: '2.4K',
      icon: Users,
      trend: '+18%',
      color: 'bg-purple-500',
    },
    {
      title: 'Scheduled',
      value: pendingPosts,
      icon: Calendar,
      trend: pendingPosts > 0 ? 'Active' : 'None',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your LinkedIn automation overview.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LinkedIn Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>LinkedIn Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection Status</span>
              <Badge variant={isLoggedIn ? 'default' : 'secondary'}>
                {isLoggedIn ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Posts</span>
              <span className="font-medium">{posts.length}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-green-600">{successfulPosts}</p>
                <p className="text-xs text-gray-500">Success</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-lg font-bold text-orange-600">{pendingPosts}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-lg font-bold text-red-600">{failedPosts}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Data Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Sheets</span>
              <Badge variant={sheetConnection ? 'default' : 'secondary'}>
                {sheetConnection ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            
            {sheetConnection && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Active Connection</p>
                <p className="text-xs text-gray-600 mt-1">
                  Sheet: {sheetConnection.sheetName}
                </p>
                {sheetConnection.lastSync && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last sync: {new Date(sheetConnection.lastSync).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {batchProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Batch Progress</span>
                  <span>{batchProgress.completed}/{batchProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(batchProgress.completed / batchProgress.total) * 100}%`,
                    }}
                  />
                </div>
                {batchProgress.failed > 0 && (
                  <p className="text-xs text-red-600">
                    {batchProgress.failed} failed
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant={
                          post.status === 'success'
                            ? 'default'
                            : post.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {post.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No posts yet. Create your first post to get started!</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Create Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}