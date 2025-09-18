import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  Eye,
  EyeOff,
  Key,
  Trash2,
  CheckCircle,
  XCircle,
  Lock,
  Linkedin,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

// --- Mock UI Components ---
// In a real application, these would come from a UI library like shadcn/ui.
// They are included here to make the component standalone and fix rendering errors.
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
);
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
);
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props} />
);
const Button = ({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
  <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props} />
);
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);
const Badge = ({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: string }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props} />
);


// --- Mock API and Store ---
// In a real application, these would be in separate files.
// They are included here to make the component standalone and fix the resolving errors.

/**
 * Mock LinkedIn API object to simulate network requests.
 * It simulates a successful login if the password is "password123".
 */
const linkedInAPI = {
  login: (data: CredentialsFormData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.username && data.password === 'password123') {
          resolve({ data: { message: 'Login successful!' } });
        } else {
          reject({
            response: {
              data: {
                message: 'Invalid credentials. Use "password123" to succeed.',
              },
            },
          });
        }
      }, 1500); // 1.5-second delay to simulate API call
    });
  },
};

const credentialsSchema = z.object({
  username: z.string().min(1, 'Username/Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

export function LinkedInVault() {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // --- Local state to replace Zustand store ---
  const [credentials, setCredentials] = useState<CredentialsFormData | null>(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const storeCredentials = (creds: CredentialsFormData) => setCredentials(creds);
  const clearCredentials = () => {
    setCredentials(null);
    setLoggedIn(false);
  };
  // --- End of local state ---


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (credentials) {
      setValue('username', credentials.username);
      setValue('password', credentials.password);
    } else {
      reset({ username: '', password: '' });
    }
  }, [credentials, setValue, reset]);

  const onSubmit = async (data: CredentialsFormData) => {
    setIsConnecting(true);
    toast.promise(linkedInAPI.login(data), {
      loading: 'Connecting to LinkedIn...',
      success: () => {
        storeCredentials(data);
        setLoggedIn(true);
        setIsConnecting(false);
        return 'Successfully connected to LinkedIn!';
      },
      error: (err: any) => {
        setLoggedIn(false);
        setIsConnecting(false);
        return err.response?.data?.message || 'Failed to connect to LinkedIn';
      },
    });
  };

  const handleDisconnect = () => {
    clearCredentials();
    toast.success('Disconnected from LinkedIn');
  };

  const testConnection = async () => {
    if (!credentials) {
      toast.error('No credentials stored to test.');
      return;
    }
    setIsTesting(true);
    toast.promise(linkedInAPI.login(credentials), {
      loading: 'Testing connection...',
      success: () => {
        setLoggedIn(true);
        setIsTesting(false);
        return 'Connection test successful!';
      },
      error: () => {
        setLoggedIn(false);
        setIsTesting(false);
        return 'Connection test failed.';
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LinkedIn Vault</h1>
          <p className="text-gray-600 text-sm">Securely manage your LinkedIn connection</p>
        </div>
      </div>
      < div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => toast.info('Help is not yet implemented.')}>
          <Lock className="mr-2 h-4 w-4" />
          Help
        </Button>
    </div>
      {/* LinkedIn Connection */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">LinkedIn Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
         
          <div className="relative">
            {/* <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div> */}
            {/* <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 dark:bg-slate-950 dark:text-slate-400">Or Connect with Password</span></div> */}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-500" />
                LinkedIn Email
              </Label>
              <Input
                id="username"
                placeholder="your.email@example.com"
                {...register('username')}
                className={`h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && <p className="text-sm text-red-500 flex items-center gap-1.5"><XCircle className="h-4 w-4" />{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-500" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your LinkedIn password"
                  {...register('password')}
                  className={`h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
               
              </div>
              {errors.password && <p className="text-sm text-red-500 flex items-center gap-1.5"><XCircle className="h-4 w-4" />{errors.password.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
     <Button size="lg" className="w-full h-10 bg-blue-500 hover:bg-[#004182]" onClick={() => toast.info('OAuth flow is the recommended but not yet implemented.')}>
            <Linkedin className="mr-2 h-5 w-5" />
            Connect with LinkedIn
          </Button>
              {isLoggedIn && (
                <Button type="button" variant="outline" onClick={handleDisconnect} className="px-6 h-11 border-slate-200 dark:border-slate-800">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Connection Status */}
      {credentials && (
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLoggedIn ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {isLoggedIn ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <p className="font-medium">LinkedIn Connection</p>
                  <p className="text-sm text-muted-foreground">
                    {isLoggedIn ? `Connected as "${credentials.username}"` : 'Connection failed or disconnected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isLoggedIn ? 'default' : 'destructive'} className="capitalize">
                  {isLoggedIn ? 'Connected' : 'Disconnected'}
                </Badge>
                {isLoggedIn && (
                  <Button variant="outline" size="sm" onClick={testConnection} disabled={isTesting} className="h-8">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
                    Test
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preparation Steps */}
        <Card className="relative overflow-hidden border border-blue-100 dark:border-blue-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50/80 to-white dark:from-blue-950/20 dark:via-blue-900/10 dark:to-slate-900/50"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-400">Security Preparation</h3>
                <p className="text-xs text-blue-600/70 dark:text-blue-300/70">Secure your account first</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">1</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Enable 2FA</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Enable Two-Factor Authentication on LinkedIn for enhanced security.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Have Credentials Ready</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Keep your login email and password handy for the next step.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Steps */}
        <Card className="relative overflow-hidden border border-blue-100 dark:border-blue-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50/80 to-white dark:from-blue-950/20 dark:via-blue-900/10 dark:to-slate-900/50"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <LinkIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-400">Connection Steps</h3>
                <p className="text-xs text-blue-600/70 dark:text-blue-300/70">Complete the integration</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">1</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Authenticate (Recommended)</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Click the "Connect with LinkedIn" button for a secure OAuth connection.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Password Fallback</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Alternatively, enter your credentials in the form below.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

