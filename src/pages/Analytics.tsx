import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLinkedInStore } from '@/store/useLinkedInStore';

export function Analytics() {
  const { posts } = useLinkedInStore();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // Mock analytics data
  const weeklyData = [
    { name: 'Mon', posts: 4, engagement: 120 },
    { name: 'Tue', posts: 3, engagement: 98 },
    { name: 'Wed', posts: 6, engagement: 186 },
    { name: 'Thu', posts: 2, engagement: 74 },
    { name: 'Fri', posts: 5, engagement: 165 },
    { name: 'Sat', posts: 1, engagement: 45 },
    { name: 'Sun', posts: 3, engagement: 102 },
  ];

  const getStatusData = () => {
    if (!posts || posts.length === 0) {
      // Fallback data when no posts exist
      return [
        { name: 'Success', value: 5, color: '#10B981' },
        { name: 'Pending', value: 3, color: '#F59E0B' },
        { name: 'Failed', value: 1, color: '#EF4444' },
      ];
    }
    
    return [
      { name: 'Success', value: posts.filter(p => p.status === 'success').length || 0, color: '#10B981' },
      { name: 'Pending', value: posts.filter(p => p.status === 'pending').length || 0, color: '#F59E0B' },
      { name: 'Failed', value: posts.filter(p => p.status === 'failed').length || 0, color: '#EF4444' },
    ].filter(item => item.value > 0); // Only show statuses that have values
  };

  const statusData = getStatusData();

  const engagementData = [
    { time: '9 AM', likes: 45, comments: 12, shares: 8 },
    { time: '12 PM', likes: 78, comments: 23, shares: 15 },
    { time: '3 PM', likes: 92, comments: 31, shares: 18 },
    { time: '6 PM', likes: 156, comments: 45, shares: 28 },
    { time: '9 PM', likes: 98, comments: 28, shares: 16 },
  ];

  const stats = [
    {
      title: 'Total Posts',
      value: posts.length,
      change: '+12%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: posts.length > 0 ? `${Math.round((posts.filter(p => p.status === 'success').length / posts.length) * 100)}%` : '0%',
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Avg. Engagement',
      value: '2.4K',
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Reach',
      value: '12.5K',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
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
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Analytics Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      Monitor your LinkedIn automation performance and insights
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <Badge 
                    variant="outline" 
                    className="group py-1 px-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200" 
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <Calendar className="h-3 w-3 mr-1.5 text-blue-500 group-hover:scale-110 transition-transform" />
                    {format(selectedDate, 'MMM d')} - {format(addDays(selectedDate, 30), 'MMM d')}
                  </Badge>
                  <DialogContent className="sm:max-w-[325px] p-0">
                    <div className="p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                        className="rounded-md border-0"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 group"
                >
                  <Zap className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
              <div className={`absolute inset-0 ${
                stat.color.includes('blue') ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30' :
                stat.color.includes('green') ? 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30' :
                stat.color.includes('purple') ? 'bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/30 dark:to-violet-950/30' :
                'bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/30 dark:to-amber-950/30'
              } opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    stat.color.includes('blue') ? 'bg-blue-500/10' :
                    stat.color.includes('green') ? 'bg-emerald-500/10' :
                    stat.color.includes('purple') ? 'bg-purple-500/10' :
                    'bg-orange-500/10'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-4 w-4 ${
                      stat.color.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                      stat.color.includes('green') ? 'text-emerald-600 dark:text-emerald-400' :
                      stat.color.includes('purple') ? 'text-purple-600 dark:text-purple-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                  <div className="flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5">
                    <TrendingUp className="h-2 w-2" />
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{stat.title}</h3>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  stat.color.includes('blue') ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  stat.color.includes('green') ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                  stat.color.includes('purple') ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-orange-500 to-orange-600'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-2 p-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <BarChart3 className="h-3 w-3 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Post Performance
            </TabsTrigger>
            <TabsTrigger 
              value="engagement" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <Activity className="h-3 w-3 mr-1.5" />
              Engagement
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <Calendar className="h-3 w-3 mr-1.5" />
              Schedule Analysis
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <CardHeader className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/20 dark:border-blue-800/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Weekly Post Activity</CardTitle>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Posts published this week</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12% vs last week
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData}>
                      <defs>
                        <linearGradient id="postGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '0.5rem',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar dataKey="posts" fill="url(#postGradient)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/30 dark:to-violet-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <CardHeader className="relative bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b border-purple-200/20 dark:border-purple-800/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Post Status Distribution</CardTitle>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Current post status breakdown</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold">
                      Updated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <defs>
                        {statusData.map((item, index) => (
                          <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={item.color} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={item.color} stopOpacity={0.95}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {statusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieGradient${index})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} posts`, name]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '0.5rem',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {statusData.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Post Performance */}
          <TabsContent value="posts" className="space-y-6">
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <CardHeader className="relative bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b border-emerald-200/20 dark:border-emerald-800/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Recent Posts Performance</CardTitle>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Latest post engagement metrics</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group">
                    <BarChart3 className="h-3 w-3 mr-1.5 group-hover:scale-110 transition-transform" />
                    View All
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative p-0">
                <div className="divide-y divide-white/20 dark:divide-slate-700/50">
                  {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="flex items-start p-4 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="mr-3">
                        <div className={
                          `w-8 h-8 rounded-full flex items-center justify-center ${
                            post.status === 'success'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                              : post.status === 'failed'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                          }`
                        }>
                          {post.status === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : post.status === 'failed' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-semibold ${
                              post.status === 'success'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : post.status === 'failed'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex flex-col items-end">
                        <div className="flex items-center space-x-1 text-sm font-bold text-slate-900 dark:text-white">
                          <Activity className="h-3 w-3 text-slate-400" />
                          <span>{Math.floor(Math.random() * 200) + 50}</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">engagements</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Engagement */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/30 dark:to-violet-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <CardHeader className="relative bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b border-purple-200/20 dark:border-purple-800/20 p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Engagement Throughout the Day</CardTitle>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Peak engagement times and patterns</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementData}>
                    <defs>
                      <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="sharesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '0.5rem',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="likes" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="shares" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Likes</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Comments</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shares</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Schedule Analysis */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/30 dark:to-amber-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <CardHeader className="relative bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-200/20 dark:border-orange-800/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Optimal Posting Times</CardTitle>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Based on audience engagement patterns</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-semibold">
                    <Clock className="h-3 w-3 mr-1" />
                    Last 30 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative p-4">
                <div className="rounded-lg border border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 p-4">
                  <div className="grid grid-cols-8 gap-2">
                    {/* Time labels */}
                    <div className="pt-8">
                      {['9 AM', '12 PM', '3 PM', '6 PM'].map((time) => (
                        <div key={time} className="h-12 flex items-center justify-end pr-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{time}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Days and heatmap cells */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="space-y-2">
                        <div className="text-center">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{day}</div>
                        </div>
                        {['9 AM', '12 PM', '3 PM', '6 PM'].map((time) => {
                          const engagement = Math.floor(Math.random() * 100) + 20;
                          const getHeatmapColor = (value: number) => {
                            if (value > 80) return 'from-emerald-400 to-emerald-500 text-white shadow-md';
                            if (value > 60) return 'from-amber-400 to-amber-500 text-white shadow-md';
                            return 'from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300';
                          };
                          return (
                            <div
                              key={time}
                              className={`h-12 rounded-lg bg-gradient-to-br p-1.5 transition-all duration-200 hover:scale-105 cursor-pointer border border-white/20 dark:border-slate-700/50 ${
                                getHeatmapColor(engagement)
                              }`}
                            >
                              <div className="flex h-full flex-col items-center justify-center">
                                <span className="text-xs font-bold">{engagement}%</span>
                                <span className="text-[10px] opacity-75">eng.</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">High Engagement (80%+)</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Medium Engagement (60-80%)</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Low Engagement (&lt;60%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}