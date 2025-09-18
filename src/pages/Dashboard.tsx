import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router-dom";

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
   const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Posts',
      value: posts.length,
      icon: MessageSquare,
      trend: '+12%',
      color: 'bg-blue-500',
    },
    // {
    //   title: 'Succ Rate',
    //   value: posts.length > 0 ? `${Math.round((successfulPosts / posts.length) * 100)}%` : '0%',
    //   icon: TrendingUp,
    //   trend: '+5%',
    //   color: 'bg-green-500',
    // },
    {
      title: 'Sheets Connected',
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your LinkedIn automation overview.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline"
          onClick={() => navigate("/analytics") }>
            <Activity className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/create-post")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Status Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow bg-card border border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
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
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold">LinkedIn Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium">Connection Status</span>
                </div>
                <Badge variant={isLoggedIn ? 'default' : 'secondary'} className="capitalize">
                  {isLoggedIn ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Total Posts</span>
                </div>
                <span className="font-semibold text-lg">{posts.length}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="relative p-4 text-center bg-green-50 dark:bg-green-500/10 rounded-lg">
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{successfulPosts}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Success</p>
              </div>
              <div className="relative p-4 text-center bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                <div className="absolute top-2 right-2">
                  <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingPosts}</p>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</p>
              </div>
              <div className="relative p-4 text-center bg-red-50 dark:bg-red-500/10 rounded-lg">
                <div className="absolute top-2 right-2">
                  <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{failedPosts}</p>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="font-semibold">Data Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Google Sheets Status */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
                  <svg className="h-4 w-4 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 21a.5.5 0 01-.5-.5V19h-2a.5.5 0 110-1h2v-2a.5.5 0 111 0v2h2a.5.5 0 110 1h-2v1.5a.5.5 0 01-.5.5z"/>
                    <path d="M21.71 20.29l-1.42-1.42A7.753 7.753 0 0012 4c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.764 7.764 0 005.29-2.71l1.42 1.42A9.969 9.969 0 0112 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a9.969 9.969 0 01-2.29 6.29z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Google Sheets</span>
              </div>
              <Badge variant={sheetConnection ? 'default' : 'secondary'} className="capitalize">
                {sheetConnection ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            
            {sheetConnection && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-sm font-medium">Active Connection</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sheet Name:</span>
                    <span className="font-medium">{sheetConnection.sheetName}</span>
                  </div>
                  {sheetConnection.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="font-medium">
                        {new Date(sheetConnection.lastSync).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {batchProgress && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
                      <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-medium">Batch Progress</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {batchProgress.completed}/{batchProgress.total}
                  </span>
                </div>
                <div className="relative pt-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div
                      className="bg-violet-500 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                      style={{
                        width: `${(batchProgress.completed / batchProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                  {batchProgress.failed > 0 && (
                    <div className="absolute right-0 -top-1 -translate-y-full">
                      <Badge variant="destructive" className="text-xs">
                        {batchProgress.failed} failed
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold">Recent Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          post.status === 'success'
                            ? 'default'
                            : post.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {post.status === 'success' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{post.status}</span>
                          </div>
                        ) : post.status === 'failed' ? (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>{post.status}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.status}</span>
                          </div>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-primary/5 rounded-lg">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-muted-foreground mb-4">No posts yet. Create your first post to get started!</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/create-post")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}