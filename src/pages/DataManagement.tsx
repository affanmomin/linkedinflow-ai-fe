import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FileSpreadsheet,
  Link,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Database,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { sheetsAPI } from '@/lib/api';
import { toast } from 'sonner';

const sheetsSchema = z.object({
  spreadsheetId: z.string().min(1, 'Spreadsheet ID is required'),
  sheetName: z.string().min(1, 'Sheet name is required'),
});

type SheetsFormData = z.infer<typeof sheetsSchema>;

export function DataManagement() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    sheetConnection,
    sheetData,
    error,
    setSheetConnection,
    setSheetData,
    setError,
  } = useDataStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SheetsFormData>({
    resolver: zodResolver(sheetsSchema),
    defaultValues: {
      spreadsheetId: sheetConnection?.spreadsheetId || '',
      sheetName: sheetConnection?.sheetName || '',
    },
  });

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const onSubmit = async (data: SheetsFormData) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const spreadsheetId = extractSpreadsheetId(data.spreadsheetId);
      
      const response = await sheetsAPI.testConnection({
        spreadsheetId,
        sheetName: data.sheetName,
      });

      const connection = {
        spreadsheetId,
        sheetName: data.sheetName,
        status: 'connected' as const,
        lastSync: new Date().toISOString(),
      };

      setSheetConnection(connection);
      setSheetData(response.data || []);
      toast.success('Successfully connected to Google Sheets!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to connect to Google Sheets');
      setSheetConnection({
        spreadsheetId: extractSpreadsheetId(data.spreadsheetId),
        sheetName: data.sheetName,
        status: 'error',
      });
      toast.error('Failed to connect to Google Sheets');
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshData = async () => {
    if (!sheetConnection || !sheetConnection.spreadsheetId || !sheetConnection.sheetName) {
      toast.error('No active sheet connection');
      return;
    }

    try {
      setIsRefreshing(true);
      const response = await sheetsAPI.testConnection({
        spreadsheetId: sheetConnection.spreadsheetId,
        sheetName: sheetConnection.sheetName,
      });

      setSheetData(response.data || []);
      setSheetConnection({
        ...sheetConnection,
        lastSync: new Date().toISOString(),
        status: 'connected',
      });
      toast.success('Data refreshed successfully!');
    } catch (error: any) {
      setError('Failed to refresh data');
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const disconnectSheets = () => {
    setSheetConnection({
      spreadsheetId: '',
      sheetName: '',
      status: 'disconnected'
    });
    setSheetData([]);
    setError(null);
    setValue('spreadsheetId', '');
    setValue('sheetName', '');
    toast.success('Disconnected from Google Sheets');
  };

  const exportData = () => {
    if (sheetData.length === 0) return;

    const headers = Object.keys(sheetData[0]);
    const csv = [
      headers.join(','),
      ...sheetData.map(row => 
        headers.map(header => 
          String(row[header] || '').replace(/,/g, ';')
        ).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheet-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="space-y-3 p-4">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Data Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      Connect and manage your data sources for LinkedIn automation
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {sheetData.length > 0 && (
                  <Button 
                    onClick={exportData} 
                    variant="outline"
                    size="sm"
                    className="group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
                  >
                    <Download className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                    Export Data
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 group"
                >
                  <Plus className="mr-1 h-3 w-3 group-hover:rotate-90 transition-transform" />
                  Add Source
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Setup Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Preparation Steps */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/20 dark:border-blue-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Preparation Steps</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Get your spreadsheet ready</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">1</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Open Google Sheets document</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Navigate to your spreadsheet</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Configure sharing</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Set public or service account access</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Steps */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-200/20 dark:border-emerald-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                  <Link className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Connection Steps</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Complete the integration</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md">1</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Copy spreadsheet details</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Get URL or ID from address bar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enter sheet name</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Provide the exact tab name</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md">3</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Connect</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Click "Connect to Sheets" button</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      

        {/* Enhanced Connection Status */}
        {sheetConnection && (
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 ${
              sheetConnection.status === 'connected' 
                ? 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30' 
                : sheetConnection.status === 'error'
                ? 'bg-gradient-to-br from-rose-50/50 to-red-50/50 dark:from-rose-950/30 dark:to-red-950/30'
                : 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30'
            } opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
            <CardHeader className="relative bg-gradient-to-r from-slate-500/10 to-slate-600/10 border-b border-slate-200/20 dark:border-slate-800/20 p-4">
              <CardTitle className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  sheetConnection.status === 'connected' 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                    : sheetConnection.status === 'error'
                    ? 'bg-gradient-to-br from-rose-500 to-red-600'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                } shadow-md`}>
                  {sheetConnection.status === 'connected' ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : sheetConnection.status === 'error' ? (
                    <XCircle className="h-4 w-4 text-white" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">Google Sheets Connection</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                    {sheetConnection.status === 'connected'
                      ? `Connected to "${sheetConnection.sheetName}"`
                      : sheetConnection.status === 'error'
                      ? 'Connection failed'
                      : 'Connecting...'}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={
                    sheetConnection.status === 'connected' ? 'default' :
                    sheetConnection.status === 'error' ? 'destructive' : 'secondary'
                  } 
                  className={`capitalize font-semibold ${
                    sheetConnection.status === 'connected' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : sheetConnection.status === 'error'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {sheetConnection.status}
                </Badge>
                {sheetConnection.status === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''} group-hover:scale-110 transition-transform`} />
                    Refresh
                  </Button>
                )}
              </div>
              
              {sheetConnection.status === 'connected' && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Active Connection</span>
                  {sheetConnection.lastSync && (
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto font-medium">
                      Last synced: {new Date(sheetConnection.lastSync).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Google Sheets Connection */}
        <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
          <CardHeader className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/20 dark:border-blue-800/20 p-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-white">Google Sheets Integration</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Connect your spreadsheet for data automation</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-4 space-y-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              {/* Connection Fields */}
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheetId" className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FileSpreadsheet className="h-3 w-3 text-blue-500" />
                    Spreadsheet URL or ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="spreadsheetId"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      {...register('spreadsheetId')}
                      className={`h-10 px-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200
                        ${errors.spreadsheetId 
                          ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 ring-red-500/20' 
                          : 'focus:ring-blue-500/20'}`}
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M7 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                        <path d="M7 21h10" />
                        <path d="M7 17h10" />
                        <path d="M7 13h10" />
                        <path d="M7 9h10" />
                        <path d="M7 5h10" />
                      </svg>
                    </div>
                  </div>
                  {errors.spreadsheetId ? (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.spreadsheetId.message}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Paste the full Google Sheets URL or just the spreadsheet ID
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheetName" className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FileSpreadsheet className="h-3 w-3 text-blue-500" />
                    Sheet Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="sheetName"
                      placeholder="e.g., Sheet1"
                      {...register('sheetName')}
                      className={`h-10 px-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200
                        ${errors.sheetName 
                          ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 ring-red-500/20' 
                          : 'focus:ring-blue-500/20'}`}
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                        <path d="M8 11h8" />
                        <path d="M8 15h8" />
                      </svg>
                    </div>
                  </div>
                  {errors.sheetName ? (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.sheetName.message}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Enter the name of the specific sheet tab
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isConnecting}
                  size="sm"
                  className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 group ${
                    isConnecting ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                      Connect to Sheets
                    </>
                  )}
                </Button>
                
                {sheetConnection && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={disconnectSheets}
                    className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/50 border border-rose-200/50 dark:border-rose-800/50 rounded-lg">
                <p className="text-sm text-rose-700 dark:text-rose-400 font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Data Preview */}
        {sheetData.length > 0 && (
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <CardHeader className="relative bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-purple-200/20 dark:border-purple-800/20 p-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-slate-900 dark:text-white">Data Preview</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Your connected spreadsheet data</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold">
                  {sheetData.length} rows
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-4">
              <div className="rounded-lg border border-white/20 dark:border-slate-700/50 overflow-hidden bg-white/50 dark:bg-slate-800/50">
                <div className="max-h-96 overflow-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 dark:border-slate-700/50">
                        {Object.keys(sheetData[0]).map((header) => (
                          <TableHead key={header} className="whitespace-nowrap bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheetData.slice(0, 10).map((row, index) => (
                        <TableRow key={index} className="border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex} className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                              {String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {sheetData.length > 10 && (
                  <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-t border-white/20 dark:border-slate-700/50 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Showing 10 of {sheetData.length} rows
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}