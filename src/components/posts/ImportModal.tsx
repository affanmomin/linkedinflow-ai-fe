import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ROWS   = 50;
const MAX_BYTES  = 5 * 1024 * 1024; // 5 MB
const ACCEPT_EXT = '.xlsx, .xls, .csv';

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'preview' | 'importing' | 'results';

interface ParsedRow { [col: string]: string }

interface ImportResult {
  imported: number;
  failed:   number;
  errors:   { row: number; message: string }[];
}

// ── File parser ───────────────────────────────────────────────────────────────

function parseSpreadsheet(file: File): Promise<{ headers: string[]; rows: ParsedRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw      = e.target?.result;
        const workbook = XLSX.read(raw, { type: 'binary', cellDates: true });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const json     = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
          raw:    false, // format dates as strings
        });

        if (json.length === 0) {
          reject(new Error('The file is empty — no rows found.'));
          return;
        }

        const headers = Object.keys(json[0]);
        const rows: ParsedRow[] = json.map((r) =>
          Object.fromEntries(headers.map((h) => [h, String(r[h] ?? '')]))
        );

        resolve({ headers, rows });
      } catch {
        reject(new Error('Could not parse the file. Make sure it is a valid Excel or CSV file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsBinaryString(file);
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DownloadTemplateButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      await postsAPI.downloadTemplate();
      toast.success('Template downloaded.');
    } catch {
      toast.error('Could not download template. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-[13px]"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading
        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        : <Download  className="h-3.5 w-3.5" />}
      Download Template
    </Button>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onParsed: (headers: string[], rows: ParsedRow[], file: File) => void;
}

function DropZone({ onParsed }: DropZoneProps) {
  const [error,   setError]   = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[], rejected: import('react-dropzone').FileRejection[]) => {
      setError(null);

      if (rejected.length > 0) {
        const code = rejected[0].errors[0]?.code;
        if (code === 'file-too-large') {
          setError(`File is too large. Maximum size is 5 MB.`);
        } else {
          setError('Invalid file type. Please upload an .xlsx, .xls, or .csv file.');
        }
        return;
      }

      const file = accepted[0];
      if (!file) return;

      setParsing(true);
      try {
        const { headers, rows } = await parseSpreadsheet(file);

        if (rows.length > MAX_ROWS) {
          setError(
            `File contains ${rows.length} rows. Maximum allowed is ${MAX_ROWS} rows. ` +
            `Please trim your file and try again.`
          );
          return;
        }

        onParsed(headers, rows, file);
      } catch (err: any) {
        setError(err.message ?? 'Failed to parse the file.');
      } finally {
        setParsing(false);
      }
    },
    [onParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel':                                           ['.xls'],
      'text/csv':                                                            ['.csv'],
      'application/csv':                                                     ['.csv'],
    },
    maxSize:   MAX_BYTES,
    multiple:  false,
    disabled:  parsing,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
          parsing && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {parsing
            ? <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            : <FileSpreadsheet className="h-5 w-5 text-primary" />}
        </div>

        {isDragActive ? (
          <p className="text-sm font-medium text-primary">Drop the file here…</p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-foreground">
                {parsing ? 'Parsing file…' : 'Drag & drop a file, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Accepts {ACCEPT_EXT} · Max {MAX_ROWS} rows · Max 5 MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Preview table ─────────────────────────────────────────────────────────────

interface PreviewTableProps {
  headers: string[];
  rows:    ParsedRow[];
}

function PreviewTable({ headers, rows }: PreviewTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-border max-h-64">
      <table className="w-full min-w-max text-xs">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-12">#</th>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-t border-border',
                i % 2 === 0 ? 'bg-background' : 'bg-muted/20'
              )}
            >
              <td className="px-3 py-2 text-muted-foreground font-mono">{i + 1}</td>
              {headers.map((h) => (
                <td
                  key={h}
                  className="px-3 py-2 text-foreground max-w-[220px] truncate"
                  title={row[h]}
                >
                  {row[h] || <span className="text-muted-foreground/50 italic">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Results view ──────────────────────────────────────────────────────────────

interface ResultsViewProps {
  result:  ImportResult;
  onClose: () => void;
  onReset: () => void;
}

function ResultsView({ result, onClose, onReset }: ResultsViewProps) {
  const allOk = result.failed === 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {result.imported}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              Imported successfully
            </p>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3',
          result.failed > 0
            ? 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
            : 'border-border bg-muted/30'
        )}>
          <XCircle className={cn(
            'h-5 w-5 shrink-0',
            result.failed > 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-muted-foreground'
          )} />
          <div>
            <p className={cn(
              'text-xl font-bold',
              result.failed > 0
                ? 'text-rose-700 dark:text-rose-400'
                : 'text-muted-foreground'
            )}>
              {result.failed}
            </p>
            <p className={cn(
              'text-xs',
              result.failed > 0
                ? 'text-rose-600 dark:text-rose-500'
                : 'text-muted-foreground'
            )}>
              Failed
            </p>
          </div>
        </div>
      </div>

      {/* Error list */}
      {result.errors && result.errors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Errors
          </p>
          <div className="max-h-48 overflow-auto rounded-lg border border-border space-y-0 divide-y divide-border">
            {result.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 text-sm bg-background"
              >
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] px-1.5 py-0 h-4 font-mono badge-error"
                >
                  Row {err.row}
                </Badge>
                <span className="text-muted-foreground leading-snug">{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        {!allOk && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import another file
          </Button>
        )}
        <Button size="sm" onClick={onClose}>
          {allOk ? 'Done' : 'Close'}
        </Button>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface ImportModalProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  onImportDone:   () => void; // called after successful import to refresh posts
}

export function ImportModal({ open, onOpenChange, onImportDone }: ImportModalProps) {
  const [step,    setStep]    = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows,    setRows]    = useState<ParsedRow[]>([]);
  const [file,    setFile]    = useState<File | null>(null);
  const [result,  setResult]  = useState<ImportResult | null>(null);

  const reset = () => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setFile(null);
    setResult(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleParsed = (h: string[], r: ParsedRow[], f: File) => {
    setHeaders(h);
    setRows(r);
    setFile(f);
    setStep('preview');
  };

  const handleImport = async () => {
    if (!file) return;
    setStep('importing');

    try {
      // Read the file as a data URL, then strip the "data:...;base64," prefix
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => {
          const dataUrl = e.target?.result as string;
          const base64  = dataUrl.split(',')[1];   // everything after the comma
          if (!base64) reject(new Error('Failed to encode file.'));
          else resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      const data = await postsAPI.importPosts(file.name, base64);
      setResult({
        imported: data.imported ?? 0,
        failed:   data.failed   ?? 0,
        errors:   data.errors   ?? [],
      });
      setStep('results');

      if ((data.imported ?? 0) > 0) {
        onImportDone();
        toast.success(`${data.imported} post${data.imported === 1 ? '' : 's'} imported.`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Import failed. Please try again.';
      toast.error(msg);
      setStep('preview'); // let them retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="icon-container-sm">
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </div>
            Import Posts from File
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to bulk-import posts. Max {MAX_ROWS} rows per file.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">

          {/* ── Upload step ── */}
          {step === 'upload' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Don't have a template?{' '}
                  <span className="text-foreground font-medium">Download one below.</span>
                </p>
                <DownloadTemplateButton />
              </div>
              <DropZone onParsed={handleParsed} />
            </>
          )}

          {/* ── Preview step ── */}
          {step === 'preview' && file && (
            <>
              {/* File info bar */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground truncate max-w-[280px]">
                    {file.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {rows.length} row{rows.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <button
                  onClick={reset}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <PreviewTable headers={headers} rows={rows} />

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={reset}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleImport}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Import {rows.length} post{rows.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </>
          )}

          {/* ── Importing step ── */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Importing posts…</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a moment.
                </p>
              </div>
            </div>
          )}

          {/* ── Results step ── */}
          {step === 'results' && result && (
            <ResultsView
              result={result}
              onClose={() => handleClose(false)}
              onReset={reset}
            />
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
