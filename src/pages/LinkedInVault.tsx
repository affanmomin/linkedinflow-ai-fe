import React, { useState } from 'react';
import {
  Shield,
  Trash2,
  CheckCircle,
  Lock,
  Linkedin,
  RefreshCw,
  Link as LinkIcon,
  HelpCircle,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';

// --- Mock UI Components ---
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border bg-white text-card-foreground shadow-sm transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${className}`} {...props} />
);
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props} />
);
const Button = ({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
  <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-800 ${className}`} {...props} />
);


// --- Mock API and Store ---
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
      }, 1500);
    });
  },
};

type CredentialsFormData = { username: string; password: string };

export function LinkedInVault() {
  const [isTesting, setIsTesting] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsFormData | null>(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const storeCredentials = (creds: CredentialsFormData) => setCredentials(creds);
  const clearCredentials = () => {
    setCredentials(null);
    setLoggedIn(false);
  };

  const handleOAuthConnect = async () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: 'Redirecting to LinkedIn...',
      success: () => {
        storeCredentials({ username: 'demo.user@linkedin.com', password: 'password123' });
        setLoggedIn(true);
        return 'Successfully connected to LinkedIn!';
      },
      error: 'Failed to connect to LinkedIn',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="space-y-6 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-2xl blur-2xl"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                        LinkedIn Vault
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        Securely manage your LinkedIn connection for automation
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast.info('Help is not yet implemented.')} 
                    className="group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
                  >
                    <HelpCircle className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                    Help
                  </Button>
                  {/* <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 group"
                    onClick={() => toast.info('Security guide is not yet implemented.')}
                  >
                    <Shield className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                    Security Guide
                  </Button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Instructions */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="group relative overflow-hidden mt-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Preparation</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Essential security steps before connecting</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-blue-200/50 dark:border-blue-800/50 ml-4">
                    <div className="pl-8 relative">
                      <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shadow-md">1</div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Enable 2FA</p>
                      <p className="text-xs">Enable Two-Factor Authentication on your LinkedIn account for enhanced security.</p>
                    </div>
                    <div className="pl-8 relative">
                      <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shadow-md">2</div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Authorize the App</p>
                      <p className="text-xs">Follow the on-screen prompts from LinkedIn to securely authorize the connection.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <LinkIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">How It Works</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Understanding the connection process</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-emerald-200/50 dark:border-emerald-800/50 ml-4">
                    <div className="pl-8 relative">
                      <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-md">1</div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Secure Connection</p>
                      <p className="text-xs">We use the official LinkedIn OAuth 2.0 protocol. Your password is never stored on our servers.</p>
                    </div>
                    <div className="pl-8 relative">
                      <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-md">2</div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Token-Based Automation</p>
                      <p className="text-xs">Once connected, we use a secure token to perform actions on your behalf, which you can revoke anytime.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Right Column: Connection Status */}
            <div className="lg:col-span-1">
              <Card className="group overflow-hidden mt-5 border-[#0A66C2] bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300 sticky top-8">
                <div className={`absolute inset-0 ${
                  isLoggedIn 
                    ? 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30' 
                    : 'bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/30'
                } opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
                <CardContent className="relative p-4 space-y-6 ">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg shadow-md ${
                        isLoggedIn 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                          : 'bg-gradient-to-br from-slate-500 to-gray-600'
                      }`}>
                        <Linkedin className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Connection Status</h3>
                    </div>
                  </div>
                  
                  {!isLoggedIn ? (
                    <div className="text-center space-y-4 ">
                      <div className="mx-auto w-16 h-16 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-white/20 dark:border-slate-700/50">
                        <Linkedin className="h-8 w-8 text-[#0A66C2]" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No account connected. Please connect your LinkedIn account to enable automation.</p>
                      <Button 
                        size="lg" 
                        className="w-full h-10 bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white hover:from-[#004182] hover:to-[#002d5a] shadow-md hover:shadow-blue-500/25 transition-all duration-200 group" 
                        onClick={handleOAuthConnect}
                      >
                        <Lock className="mr-2 h-3 w-3 group-hover:scale-110 transition-transform" /> 
                        Connect with LinkedIn
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-emerald-100/50 dark:bg-emerald-900/30 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">Successfully Connected</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate">{credentials?.username}</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={testConnection} 
                          disabled={isTesting} 
                          className="w-full h-9 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 group"
                        >
                          <RefreshCw className={`${isTesting ? 'animate-spin' : ''} mr-2 h-3 w-3 group-hover:scale-110 transition-transform`} />
                          Test Connection
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleDisconnect} 
                          className="w-full h-9 bg-white/50 dark:bg-slate-800/50 text-rose-600 border-slate-200/50 dark:border-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200 group"
                        >
                          <Trash2 className="mr-2 h-3 w-3 group-hover:scale-110 transition-transform" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

