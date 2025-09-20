import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router-dom";

import {
  MessageSquare,
  Users,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  Plus,
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
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Success Rate',
      value: posts.length > 0 ? `${Math.round((successfulPosts / posts.length) * 100)}%` : '0%',
      icon: Target,
      trend: '+5%',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Sheets Connected',
      value: '2.4K',
      icon: Users,
      trend: '+18%',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Scheduled',
      value: pendingPosts,
      icon: Calendar,
      trend: pendingPosts > 0 ? 'Active' : 'None',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="space-y-6 p-4">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      Welcome back! Here's your LinkedIn automation overview.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
                  onClick={() => navigate("/analytics")}
                >
                  <BarChart3 className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  View Analytics
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 group"
                  onClick={() => navigate("/create-post")}
                >
                  <Plus className="mr-1 h-3 w-3 group-hover:rotate-90 transition-transform" />
                  Create Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        <ArrowUpRight className="h-2 w-2 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </CardContent>
            </Card> 
          ))}
        </div>

        {/* Enhanced Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LinkedIn Status */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/20 dark:border-blue-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">LinkedIn Status</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Connection & Activity Overview</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                      <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Connection Status</span>
                  </div>
                  <Badge 
                    variant={isLoggedIn ? 'default' : 'secondary'} 
                    className={`capitalize font-semibold text-xs ${isLoggedIn ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                  >
                    {isLoggedIn ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                      <MessageSquare className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Total Posts</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">{posts.length}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="relative p-3 text-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 group hover:shadow-md transition-all duration-200">
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{successfulPosts}</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Success</p>
                </div>
                <div className="relative p-3 text-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50 group hover:shadow-md transition-all duration-200">
                  <div className="absolute top-2 right-2">
                    <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingPosts}</p>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Pending</p>
                </div>
                <div className="relative p-3 text-center bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/50 rounded-lg border border-rose-200/50 dark:border-rose-800/50 group hover:shadow-md transition-all duration-200">
                  <div className="absolute top-2 right-2">
                    <XCircle className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                  </div>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{failedPosts}</p>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/30 dark:to-cyan-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-teal-200/20 dark:border-teal-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Data Sources</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Integration & Sync Status</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4 space-y-4">
              {/* Google Sheets Status */}
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
                    <svg className="h-3 w-3 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.5 21a.5.5 0 01-.5-.5V19h-2a.5.5 0 110-1h2v-2a.5.5 0 111 0v2h2a.5.5 0 110 1h-2v1.5a.5.5 0 01-.5.5z"/>
                      <path d="M21.71 20.29l-1.42-1.42A7.753 7.753 0 0012 4c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.764 7.764 0 005.29-2.71l1.42 1.42A9.969 9.969 0 0112 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a9.969 9.969 0 01-2.29 6.29z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Google Sheets</span>
                </div>
                <Badge 
                  variant={sheetConnection ? 'default' : 'secondary'} 
                  className={`capitalize font-semibold text-xs ${sheetConnection ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                >
                  {sheetConnection ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              
              {sheetConnection && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Active Connection</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Sheet Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{sheetConnection.sheetName}</span>
                    </div>
                    {sheetConnection.lastSync && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Last Sync:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {new Date(sheetConnection.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {batchProgress && (
                <div className="space-y-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
                        <Activity className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Batch Progress</span>
                    </div>
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {batchProgress.completed}/{batchProgress.total}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all duration-700 ease-in-out shadow-sm"
                        style={{
                          width: `${(batchProgress.completed / batchProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                    {batchProgress.failed > 0 && (
                      <div className="absolute right-0 -top-1 -translate-y-full">
                        <Badge variant="destructive" className="text-xs font-semibold">
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

        {/* Enhanced Recent Posts */}
        <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
          <CardHeader className="relative bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-200/20 dark:border-indigo-800/20 p-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Recent Posts</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Latest Activity & Status</p>
                </div>
              </div>
              {recentPosts.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  onClick={() => navigate("/create-post")}
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pt-4">
            {recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="group/post flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-md group-hover/post:scale-110 transition-transform duration-200">
                      <MessageSquare className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            post.status === 'success'
                              ? 'default'
                              : post.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={`capitalize font-semibold text-xs ${
                            post.status === 'success'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : post.status === 'failed'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {post.status === 'success' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-2 w-2" />
                              <span>{post.status}</span>
                            </div>
                          ) : post.status === 'failed' ? (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-2 w-2" />
                              <span>{post.status}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              <span>{post.status}</span>
                            </div>
                          )}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl w-fit mx-auto mb-4 shadow-md">
                  <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto text-sm">
                  Create your first post to get started with LinkedIn automation and see your content here.
                </p>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-indigo-500/25 transition-all duration-200 group"
                  onClick={() => navigate("/create-post")}
                >
                  <Plus className="mr-1 h-3 w-3 group-hover:rotate-90 transition-transform" />
                  Create Your First Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}