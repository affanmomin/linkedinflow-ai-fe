import React, { useState } from 'react';
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
  Upload,
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
    isLoading,
    error,
    setSheetConnection,
    setSheetData,
    setLoading,
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


    
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans	font-family: ui-sans-serif, system-ui, sans-serif,">Data Management</h1>
          <p className="text-gray-600 text-xs">Connect and manage your data sources</p>
        </div> */}
        {sheetData.length > 0 && (
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Preparation Steps */}
        <Card className="relative overflow-hidden border border-blue-100 dark:border-blue-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50/80 to-white dark:from-blue-950/20 dark:via-blue-900/10 dark:to-slate-900/50"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-400">Preparation Steps</h3>
                <p className="text-xs text-blue-600/70 dark:text-blue-300/70">Get your spreadsheet ready</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">1</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Open Google Sheets document</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Navigate to your spreadsheet</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Configure sharing</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Set public or service account access</p>
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
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-400">Connection Steps</h3>
                <p className="text-xs text-blue-600/70 dark:text-blue-300/70">Complete the integration</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">1</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Copy spreadsheet details</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Get URL or ID from address bar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Enter sheet name</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Provide the exact tab name</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors group">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-[10px] font-bold text-blue-600">3</div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Connect</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">Click "Connect to Sheets" button</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      

      {/* Connection Status */}
      {sheetConnection && (
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sheetConnection.status === 'connected' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : sheetConnection.status === 'error'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    {sheetConnection.status === 'connected' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : sheetConnection.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Google Sheets Connection</p>
                    <p className="text-sm text-muted-foreground">
                      {sheetConnection.status === 'connected'
                        ? `Connected to "${sheetConnection.sheetName}"`
                        : sheetConnection.status === 'error'
                        ? 'Connection failed'
                        : 'Connecting...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    sheetConnection.status === 'connected' ? 'default' :
                    sheetConnection.status === 'error' ? 'destructive' : 'secondary'
                  } className="capitalize">
                    {sheetConnection.status}
                  </Badge>
                  {sheetConnection.status === 'connected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={isRefreshing}
                      className="h-8"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
              
              {sheetConnection.status === 'connected' && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">Active Connection</span>
                  {sheetConnection.lastSync && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Last synced: {new Date(sheetConnection.lastSync).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Sheets Connection */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold font-family: ui-serif, Georgia, Cambria,">Google Sheets Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Connection Fields */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="spreadsheetId" className="text-sm font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500 font-family: ui-monospace,x" />
                  Spreadsheet URL or ID
                </Label>
                <div className="relative">
                  <Input
                    id="spreadsheetId"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    {...register('spreadsheetId')}
                    className={`h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors
                      ${errors.spreadsheetId 
                        ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 ring-red-500/20' 
                        : 'focus:border-blue-500 dark:focus:border-blue-400 ring-blue-500/20'}`}
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    {errors.spreadsheetId.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Paste the full Google Sheets URL or just the spreadsheet ID
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheetName" className="text-sm font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500 font-family: ui-monospace," />
                  Sheet Name
                </Label>
                <div className="relative">
                  <Input
                    id="sheetName"
                    placeholder="e.g., Sheet1"
                    {...register('sheetName')}
                    className={`h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors
                      ${errors.sheetName 
                        ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 ring-red-500/20' 
                        : 'focus:border-blue-500 dark:focus:border-blue-400 ring-blue-500/20'}`}
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M8 11h8" />
                      <path d="M8 15h8" />
                    </svg>
                  </div>
                </div>
                {errors.sheetName ? (
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    {errors.sheetName.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
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
                className={`flex-1 h-11 text-white shadow-lg shadow-blue-500/25 
                  ${isConnecting 
                    ? 'bg-blue-500/80 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'}`}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-5 w-5" />
                    Connect to Sheets
                  </>
                )}
              </Button>
              
              {sheetConnection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={disconnectSheets}
                  className="px-6 h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      {sheetData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Data Preview</span>
              <Badge variant="secondary">{sheetData.length} rows</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(sheetData[0]).map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheetData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="max-w-xs truncate">
                            {String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {sheetData.length > 10 && (
                <div className="p-3 bg-gray-50 border-t text-center">
                  <p className="text-sm text-gray-600">
                    Showing 10 of {sheetData.length} rows
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
}