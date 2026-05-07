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
      <div className="rounded-2xl border border-[#e0dfdc] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#eef3f8] p-2 text-[#0a66c2] border border-[#dce6f1]">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#191919]">LinkedIn Vault</h1>
                <p className="text-xs font-medium text-[#595959]">
                  Securely manage your LinkedIn connection for automation
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Help is not yet implemented.')}
              className="!border-[#e0dfdc] !bg-[#f3f2ee] !text-[#191919] hover:!bg-[#eef3f8]"
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              Help
            </Button>
          </div>
      </div>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="mt-1 overflow-hidden border-[#e0dfdc] bg-white text-[#191919] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-[#eef3f8] p-2 text-[#0a66c2] border border-[#dce6f1]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#191919]">Security Preparation</h3>
                    <p className="text-xs font-normal text-[#595959]">
                      Essential security steps before connecting
                    </p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-[#dce6f1] pl-2 text-sm text-[#595959] space-y-4">
                  <div className="relative pl-8">
                    <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eef3f8] text-[10px] font-bold text-[#0a66c2] border border-[#dce6f1]">1</div>
                    <p className="font-semibold text-[#191919]">Enable 2FA</p>
                    <p className="text-xs">Enable Two-Factor Authentication on your LinkedIn account for enhanced security.</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eef3f8] text-[10px] font-bold text-[#0a66c2] border border-[#dce6f1]">2</div>
                    <p className="font-semibold text-[#191919]">Authorize the App</p>
                    <p className="text-xs">Follow the on-screen prompts from LinkedIn to securely authorize the connection.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-[#e0dfdc] bg-white text-[#191919] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-[#eef3f8] p-2 text-[#0a66c2] border border-[#dce6f1]">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#191919]">How It Works</h3>
                      <p className="text-xs font-normal text-[#595959]">
                        Understanding the connection process
                      </p>
                    </div>
                  </div>
              <div className="ml-4 border-l-2 border-[#dce6f1] pl-2 text-sm text-[#595959] space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eef3f8] text-[10px] font-bold text-[#0a66c2] border border-[#dce6f1]">1</div>
                  <p className="font-semibold text-[#191919]">Secure Connection</p>
                  <p className="text-xs">We use official LinkedIn OAuth 2.0. Your password is never stored on our servers.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-[-9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eef3f8] text-[10px] font-bold text-[#0a66c2] border border-[#dce6f1]">2</div>
                  <p className="font-semibold text-[#191919]">Token-Based Automation</p>
                  <p className="text-xs">Once connected, secure tokens perform actions on your behalf and can be revoked anytime.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 overflow-hidden border-[#e0dfdc] bg-white text-[#191919] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <CardContent className="space-y-6 p-5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div
                        className={`rounded-lg p-2 shadow-[0_0_0_1px_rgba(132,204,22,0.28)_inset] ${
                          showConnected
                            ? 'bg-[#eef3f8] text-[#0a66c2] border border-[#dce6f1]'
                            : 'bg-[#f3f2ee] text-[#86888a] border border-[#e0dfdc]'
                        }`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold text-[#191919]">Connection Status</h3>
                    </div>
                  </div>

                  {!showConnected ? (
                    <div className="text-center space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#dce6f1] bg-[#eef3f8]">
                        <Linkedin className="h-8 w-8 text-[#0a66c2]" />
                      </div>
                      <p className="text-xs font-medium text-[#595959]">
                        {showRevoked
                          ? 'Your LinkedIn token has expired. Please reconnect.'
                          : 'No account connected. Connect your LinkedIn to enable automation.'}
                      </p>
                      <Button
                        size="lg"
                          className="group h-10 w-full !border-[#0a66c2] !bg-[#0a66c2] !text-white hover:!bg-[#004182]"
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
                      <div className="flex items-center gap-3 rounded-lg border border-[#dce6f1] bg-[#eef3f8] p-4">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#0a66c2]" />
                        <div>
                          <p className="text-sm font-semibold text-[#0a66c2]">Successfully Connected</p>
                          {vanityName && (
                            <p className="truncate text-xs text-[#595959]">@{vanityName}</p>
                          )}
                          {connectedAt && (
                            <p className="text-xs text-[#595959]">
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
                          className="h-9 w-full !border-[#e0dfdc] !bg-[#f3f2ee] !text-[#191919] hover:!bg-[#eef3f8]"
                        >
                          <RefreshCw className={`${isTesting ? 'animate-spin' : ''} mr-2 h-3 w-3`} />
                          Test Connection
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDisconnect}
                          disabled={isLoading}
                          className="h-9 w-full !border-[#e0dfdc] !bg-white !text-[#191919] hover:!bg-[#f3f2ee]"
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
