import { useEffect, useState } from 'react';
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
import { useLinkedInOAuth } from '../hooks/useLinkedInOAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LinkedInVault() {
  const [isTesting, setIsTesting] = useState(false);

  const {
    linkedInStatus,
    isLoading,
    isConnected,
    isExpired,
    vanityName,
    connectedAt,
    connect,
    disconnect,
    fetchStatus,
    testConnection,
  } = useLinkedInOAuth();

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleTest = async () => {
    setIsTesting(true);
    await testConnection();
    setIsTesting(false);
  };

  const showConnected = isConnected;
  const showRevoked = linkedInStatus !== null && !isConnected && isExpired;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-300/18 via-lime-100/10 to-lime-300/14 blur-2xl" />
        <div className="relative rounded-2xl border border-black/15 bg-white/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-lime-300/20 p-2 text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.22)_inset]">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">LinkedIn Vault</h1>
                <p className="text-xs font-medium text-black/70">
                  Securely manage your LinkedIn connection for automation
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Help is not yet implemented.')}
              className="!border-black/20 !bg-white !text-black hover:!bg-black/5"
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              Help
            </Button>
          </div>
        </div>
      </div>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="group relative mt-1 overflow-hidden border-black/10 bg-white/86 text-black shadow-[0_8px_22px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:bg-white/94">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-300/12 to-transparent opacity-80" />
            <CardContent className="relative p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-lime-300/20 p-2 text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.22)_inset]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black">Security Preparation</h3>
                    <p className="text-xs font-normal text-black/70">
                      Essential security steps before connecting
                    </p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-lime-500/25 pl-2 text-sm text-black/80 space-y-4">
                  <div className="relative pl-8">
                    <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-700 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset]">1</div>
                    <p className="font-semibold text-black">Enable 2FA</p>
                    <p className="text-xs">Enable Two-Factor Authentication on your LinkedIn account for enhanced security.</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-700 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset]">2</div>
                    <p className="font-semibold text-black">Authorize the App</p>
                    <p className="text-xs">Follow the on-screen prompts from LinkedIn to securely authorize the connection.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-black/10 bg-white/86 text-black shadow-[0_8px_22px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:bg-white/94">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 to-transparent opacity-60" />
            <CardContent className="relative p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-lime-300/20 p-2 text-lime-300 shadow-[0_0_0_1px_rgba(163,230,53,0.22)_inset]">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black">How It Works</h3>
                      <p className="text-xs font-normal text-black/70">
                        Understanding the connection process
                      </p>
                    </div>
                  </div>
              <div className="ml-4 border-l-2 border-lime-500/25 pl-2 text-sm text-black/80 space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-700 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset]">1</div>
                  <p className="font-semibold text-black">Secure Connection</p>
                  <p className="text-xs">We use official LinkedIn OAuth 2.0. Your password is never stored on our servers.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-700 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset]">2</div>
                  <p className="font-semibold text-black">Token-Based Automation</p>
                  <p className="text-xs">Once connected, secure tokens perform actions on your behalf and can be revoked anytime.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 overflow-hidden border-black/10 bg-white/88 text-black shadow-[0_8px_22px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <CardContent className="space-y-6 p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div
                        className={`rounded-lg p-2 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset] ${
                          showConnected
                            ? 'bg-lime-100 text-lime-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold text-black">Connection Status</h3>
                    </div>
                  </div>

                  {!showConnected ? (
                    <div className="text-center space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/8">
                        <Linkedin className="h-8 w-8 text-lime-300" />
                      </div>
                      <p className="text-xs font-medium text-black/75">
                        {showRevoked
                          ? 'Your LinkedIn token has expired. Please reconnect.'
                          : 'No account connected. Connect your LinkedIn to enable automation.'}
                      </p>
                      <Button
                        size="lg"
                          className="group h-10 w-full !border-lime-500/35 !bg-lime-100 !text-black hover:!bg-lime-200"
                        onClick={handleConnect}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Lock className="mr-2 h-3 w-3 group-hover:scale-110 transition-transform" />
                        )}
                        {isLoading
                          ? 'Connecting...'
                          : showRevoked
                          ? 'Reconnect LinkedIn'
                          : 'Connect with LinkedIn'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-lg border border-lime-300/40 bg-lime-50 p-4">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-lime-600" />
                        <div>
                          <p className="text-sm font-semibold text-lime-700">Successfully Connected</p>
                          {vanityName && (
                            <p className="truncate text-xs text-black/75">@{vanityName}</p>
                          )}
                          {connectedAt && (
                            <p className="text-xs text-black/70">
                              Connected: {new Date(connectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTest}
                          disabled={isTesting || isLoading}
                          className="h-9 w-full !border-black/20 !bg-white !text-black hover:!bg-black/5"
                        >
                          <RefreshCw className={`${isTesting ? 'animate-spin' : ''} mr-2 h-3 w-3`} />
                          Test Connection
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDisconnect}
                          disabled={isLoading}
                          className="h-9 w-full !border-rose-300/45 !bg-rose-100 !text-rose-800 hover:!bg-rose-200"
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
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
  );
}
