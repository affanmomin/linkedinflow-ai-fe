import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileSpreadsheet,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useDataStore } from '@/store/useDataStore';
import { sheetsAPI, linkedInAPI } from '@/lib/api';
import { toast } from 'sonner';

export function BatchProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  
  const { batchProgress, setBatchProgress, isLoggedIn } = useLinkedInStore();
  const { sheetConnection, sheetData } = useDataStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
    },
  });

  const processExcelFile = async () => {
    if (!uploadedFile || !isLoggedIn) {
      toast.error('Please upload a file and ensure LinkedIn is connected');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Upload and process the Excel file
      const response = await sheetsAPI.uploadAndProcessExcel(uploadedFile);
      const posts = response.data;

      setBatchProgress({
        total: posts.length,
        completed: 0,
        failed: 0,
      });

      // Process posts one by one
      const processResults = [];
      for (let i = 0; i < posts.length; i++) {
        try {
          await linkedInAPI.createAndPost({
            content: posts[i].content,
            scheduleTime: posts[i].scheduleTime,
          });
          
          processResults.push({
            id: i + 1,
            content: posts[i].content,
            status: 'success',
            timestamp: new Date().toISOString(),
          });

          setBatchProgress(prev => prev ? {
            ...prev,
            completed: prev.completed + 1,
          } : null);
        } catch (error) {
          processResults.push({
            id: i + 1,
            content: posts[i].content,
            status: 'failed',
            error: (error as any).message,
            timestamp: new Date().toISOString(),
          });

          setBatchProgress(prev => prev ? {
            ...prev,
            failed: prev.failed + 1,
            completed: prev.completed + 1,
          } : null);
        }

        // Add delay between posts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setResults(processResults);
      toast.success('Batch processing completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFromSheets = async () => {
    if (!sheetConnection || !isLoggedIn) {
      toast.error('Please connect Google Sheets and LinkedIn first');
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await linkedInAPI.processPostsFromSource({
        source: 'sheets',
        spreadsheetId: sheetConnection.spreadsheetId,
        sheetName: sheetConnection.sheetName,
      });

      toast.success('Google Sheets processing started!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sheets processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['ID', 'Content', 'Status', 'Error', 'Timestamp'],
      ...results.map(r => [
        r.id,
        r.content.replace(/,/g, ';'),
        r.status,
        r.error || '',
        r.timestamp,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Processing</h1>
          <p className="text-gray-600">Upload and process multiple posts at once</p>
        </div>
        {results.length > 0 && (
          <Button onClick={downloadResults} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
        )}
      </div>

      {/* Status Cards */}
      {batchProgress && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Processing Progress</h3>
              <Badge variant={isProcessing ? 'default' : 'secondary'}>
                {isProcessing ? 'Running' : 'Completed'}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <Progress 
                value={(batchProgress.completed / batchProgress.total) * 100} 
                className="w-full"
              />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{batchProgress.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {batchProgress.completed - batchProgress.failed}
                  </p>
                  <p className="text-sm text-gray-600">Success</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{batchProgress.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="excel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="excel">Excel Upload</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
        </TabsList>

        {/* Excel Upload */}
        <TabsContent value="excel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Excel File Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive
                        ? 'Drop the Excel file here...'
                        : 'Drag & drop your Excel file, or click to browse'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Supports .xlsx, .xls, and .csv files
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={processExcelFile}
                    disabled={!uploadedFile || isProcessing || !isLoggedIn}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Processing
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Sheets */}
        <TabsContent value="sheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5" />
                <span>Google Sheets Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sheetConnection ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          Connected to Google Sheets
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Sheet: {sheetConnection.sheetName}
                      </p>
                    </div>

                    {sheetData.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-2">Preview ({sheetData.length} rows)</p>
                        <div className="max-h-32 overflow-auto">
                          {sheetData.slice(0, 3).map((row, index) => (
                            <div key={index} className="text-sm text-gray-600 truncate">
                              {Object.values(row).join(' | ')}
                            </div>
                          ))}
                          {sheetData.length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">
                              ...and {sheetData.length - 3} more rows
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={processFromSheets}
                      disabled={isProcessing || !isLoggedIn}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Process from Sheets
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Connect to Google Sheets in Data Management first
                    </p>
                    <Button variant="outline" className="mt-4">
                      Go to Data Management
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {result.content}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                      >
                        {result.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}