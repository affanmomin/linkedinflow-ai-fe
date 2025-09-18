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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor your LinkedIn automation performance</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <Badge 
                variant="outline" 
                className="py-1 px-2 cursor-pointer hover:bg-accent" 
                onClick={() => setIsCalendarOpen(true)}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
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
            {/* <Badge variant="outline" className="py-1 px-2">
              <Activity className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Real-time
            </Badge> */}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-${stat.color.split('-')[1]}-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color.replace('text', 'bg')}/10 ring-1 ring-${stat.color.split('-')[1]}-100/50 dark:ring-${stat.color.split('-')[1]}-900/50`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full px-2 py-0.5">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{stat.change}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-4 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Post Performance
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
            <Activity className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Analysis
            </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Weekly Post Activity</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" /> +12% vs last week
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
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

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Post Status Distribution</CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    Updated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
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
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
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
                <div className="flex justify-center space-x-6 mt-6">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-medium">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Post Performance */}
        <TabsContent value="posts" className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-950/20"></div>
            <CardHeader className="relative border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Posts Performance</CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="mr-4">
                      <div className={
                        `w-10 h-10 rounded-full flex items-center justify-center ${
                          post.status === 'success'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                            : post.status === 'failed'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/20'
                        }`
                      }>
                        {post.status === 'success' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : post.status === 'failed' ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-2 mb-1">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant="secondary"
                          className={
                            post.status === 'success'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                              : post.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                          }
                        >
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <div className="flex items-center space-x-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span>{Math.floor(Math.random() * 200) + 50}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">engagements</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Throughout the Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="likes" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="shares" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-600">Shares</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Analysis */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950/20"></div>
            <CardHeader className="relative border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Optimal Posting Times</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Based on audience engagement patterns</p>
                </div>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Last 30 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="rounded-lg border bg-card p-4">
                <div className="grid grid-cols-8 gap-2">
                  {/* Time labels */}
                  <div className="pt-8">
                    {['9 AM', '12 PM', '3 PM', '6 PM'].map((time) => (
                      <div key={time} className="h-12 flex items-center justify-end pr-2">
                        <span className="text-xs font-medium text-gray-500">{time}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Days and heatmap cells */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="space-y-2">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{day}</div>
                      </div>
                      {['9 AM', '12 PM', '3 PM', '6 PM'].map((time) => {
                        const engagement = Math.floor(Math.random() * 100) + 20;
                        const getHeatmapColor = (value: number) => {
                          if (value > 80) return 'from-green-400 to-green-500 text-white';
                          if (value > 60) return 'from-yellow-400 to-yellow-500 text-white';
                          return 'from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300';
                        };
                        return (
                          <div
                            key={time}
                            className={`h-12 rounded-md bg-gradient-to-br p-1.5 transition-all duration-200 hover:scale-105 cursor-pointer ${
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
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-green-400 to-green-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">High Engagement (80%+)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-yellow-400 to-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Medium Engagement (60-80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Low Engagement (&lt;60%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}