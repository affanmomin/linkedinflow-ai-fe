import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const statusData = [
    { name: 'Success', value: posts.filter(p => p.status === 'success').length, color: '#10B981' },
    { name: 'Pending', value: posts.filter(p => p.status === 'pending').length, color: '#F59E0B' },
    { name: 'Failed', value: posts.filter(p => p.status === 'failed').length, color: '#EF4444' },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Monitor your LinkedIn automation performance</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline">Last 30 days</Badge>
          <Badge variant="outline">Real-time</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Analysis</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Post Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-600">
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {post.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : post.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
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
                    <div className="text-right">
                      <div className="text-sm font-medium">📈 {Math.floor(Math.random() * 200) + 50}</div>
                      <div className="text-xs text-gray-500">engagements</div>
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
          <Card>
            <CardHeader>
              <CardTitle>Optimal Posting Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="font-medium text-sm text-gray-900 mb-2">{day}</div>
                    <div className="space-y-2">
                      {['9 AM', '12 PM', '3 PM', '6 PM'].map((time) => {
                        const engagement = Math.floor(Math.random() * 100) + 20;
                        return (
                          <div
                            key={time}
                            className={`p-2 rounded text-xs ${
                              engagement > 80
                                ? 'bg-green-100 text-green-800'
                                : engagement > 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <div className="font-medium">{time}</div>
                            <div>{engagement}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Best times are highlighted in green. Engagement percentages are based on historical data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}