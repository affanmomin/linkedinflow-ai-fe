import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Shield,
  Eye,
  EyeOff,
  Key,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Lock,
  Linkedin,
} from 'lucide-react';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { linkedInAPI } from '@/lib/api';
import { toast } from 'sonner';

const credentialsSchema = z.object({
  username: z.string().min(1, 'Username/Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

export function LinkedInVault() {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    credentials,
    isLoggedIn,
    storeCredentials,
    clearCredentials,
    setLoggedIn,
  } = useLinkedInStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      username: credentials?.username || '',
      password: credentials?.password || '',
    },
  });

  const onSubmit = async (data: CredentialsFormData) => {
    try {
      setIsConnecting(true);
      
      // Store credentials first
      storeCredentials(data);
      
      // Test connection to LinkedIn
      await linkedInAPI.login(data);
      
      setLoggedIn(true);
      toast.success('LinkedIn credentials stored and connection established!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to connect to LinkedIn');
      setLoggedIn(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClearCredentials = () => {
    clearCredentials();
    reset();
    toast.success('Credentials cleared successfully');
  };

  const testConnection = async () => {
    if (!credentials) {
      toast.error('No credentials stored');
      return;
    }

    try {
      setIsConnecting(true);
      await linkedInAPI.login(credentials);
      setLoggedIn(true);
      toast.success('Connection test successful!');
    } catch (error: any) {
      toast.error('Connection test failed');
      setLoggedIn(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">LinkedIn Vault</h1>
        <p className="text-gray-600 mt-2">
          Securely store your LinkedIn credentials for automated posting
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Security & Privacy</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your credentials are encrypted and stored locally. We never share your 
                login information with third parties. Use app-specific passwords when available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Linkedin className="h-5 w-5" />
            <span>Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">
                  {isLoggedIn ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-600">
                  {isLoggedIn
                    ? 'Ready for automated posting'
                    : 'Store credentials to enable automation'}
                </p>
              </div>
            </div>
            <Badge variant={isLoggedIn ? 'default' : 'secondary'}>
              {isLoggedIn ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {credentials?.username && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Stored Account</p>
              <p className="text-sm text-gray-600">{credentials.username}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>
              {credentials ? 'Update Credentials' : 'Store Credentials'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">LinkedIn Email/Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your.email@example.com"
                {...register('username')}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your LinkedIn password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? 'Connecting...' : 'Store & Connect'}
              </Button>
              
              {credentials && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isConnecting}
                >
                  Test Connection
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Actions */}
      {credentials && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Stored Credentials</p>
                <p className="text-sm text-gray-600">
                  Clear stored credentials and disconnect from LinkedIn
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Credentials</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove your stored LinkedIn credentials 
                      and disconnect the automation. You'll need to re-enter them 
                      to continue using the service.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCredentials}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear Credentials
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-green-900 mb-2">Security Tips</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use LinkedIn's app-specific passwords when possible</li>
            <li>• Enable two-factor authentication on your LinkedIn account</li>
            <li>• Regularly monitor your LinkedIn login activity</li>
            <li>• Update your credentials if you change your LinkedIn password</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}