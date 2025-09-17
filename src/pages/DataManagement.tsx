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
    if (!sheetConnection) return;

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
    setSheetConnection(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
          <p className="text-gray-600">Connect and manage your data sources</p>
        </div>
        {sheetData.length > 0 && (
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        )}
      </div>

      {/* Connection Status */}
      {sheetConnection && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {sheetConnection.status === 'connected' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : sheetConnection.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium">Google Sheets Connection</p>
                  <p className="text-sm text-gray-600">
                    {sheetConnection.status === 'connected'
                      ? `Connected to "${sheetConnection.sheetName}"`
                      : sheetConnection.status === 'error'
                      ? 'Connection failed'
                      : 'Connecting...'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge variant={
                  sheetConnection.status === 'connected' ? 'default' :
                  sheetConnection.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {sheetConnection.status}
                </Badge>
                {sheetConnection.status === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            
            {sheetConnection.lastSync && (
              <p className="text-xs text-gray-500 mt-2">
                Last synced: {new Date(sheetConnection.lastSync).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Google Sheets Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Google Sheets Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spreadsheetId">Spreadsheet URL or ID</Label>
              <Input
                id="spreadsheetId"
                placeholder="https://docs.google.com/spreadsheets/d/... or just the ID"
                {...register('spreadsheetId')}
                className={errors.spreadsheetId ? 'border-red-500' : ''}
              />
              {errors.spreadsheetId && (
                <p className="text-sm text-red-500">{errors.spreadsheetId.message}</p>
              )}
              <p className="text-xs text-gray-500">
                You can paste the full Google Sheets URL or just the spreadsheet ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheetName">Sheet Name</Label>
              <Input
                id="sheetName"
                placeholder="Sheet1"
                {...register('sheetName')}
                className={errors.sheetName ? 'border-red-500' : ''}
              />
              {errors.sheetName && (
                <p className="text-sm text-red-500">{errors.sheetName.message}</p>
              )}
              <p className="text-xs text-gray-500">
                The name of the specific sheet tab within your spreadsheet
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Connect to Sheets
                  </>
                )}
              </Button>
              
              {sheetConnection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={disconnectSheets}
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

      {/* Setup Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">Setup Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. Open your Google Sheets document</p>
            <p>2. Make sure it's shared publicly or with service account access</p>
            <p>3. Copy the spreadsheet URL or ID</p>
            <p>4. Enter the exact sheet name (tab name at the bottom)</p>
            <p>5. Click "Connect to Sheets" to establish the connection</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}