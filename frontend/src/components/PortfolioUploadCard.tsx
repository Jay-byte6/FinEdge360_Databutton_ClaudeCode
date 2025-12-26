import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usePortfolioStore from '@/utils/portfolioStore';
import useAuthStore from '@/utils/authStore';

interface PortfolioUploadCardProps {
  onUploadSuccess?: () => void;
}

export const PortfolioUploadCard = ({ onUploadSuccess }: PortfolioUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const { uploadStatement, isLoading } = usePortfolioStore();
  const { user } = useAuthStore();

  const validateFile = (file: File): string | null => {
    // Check file type
    const validExtensions = ['.pdf', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload PDF or Excel files only.';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 10MB.';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast.error('Please sign in to upload');
      return;
    }

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Upload file (with password if provided)
    const password = pdfPassword || undefined;
    const result = await uploadStatement(file, user.id, password);

    // Call success callback if upload was successful
    if (result && result.success && onUploadSuccess) {
      onUploadSuccess();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload CAMS Statement
        </CardTitle>
        <CardDescription>
          Upload your CAMS consolidated account statement (PDF or Excel format) to automatically track your mutual fund portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-gray-400'}
            ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-medium">Processing your statement...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <>
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop your CAMS statement here</p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse (PDF, Excel)
              </p>
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                className="hidden"
                id="file-upload"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
              <Button variant="outline" disabled={isLoading}>
                Choose File
              </Button>
            </>
          )}
        </div>

        {/* Password Input for Protected PDFs */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="password-protected"
              checked={showPasswordInput}
              onChange={(e) => setShowPasswordInput(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="password-protected" className="text-sm font-medium text-gray-700 cursor-pointer">
              My PDF is password-protected
            </label>
          </div>

          {showPasswordInput && (
            <div className="mt-3">
              <label htmlFor="pdf-password" className="block text-sm font-medium text-gray-700 mb-2">
                PDF Password (usually your PAN)
              </label>
              <input
                type="text"
                id="pdf-password"
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                placeholder="Enter your PDF password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                CAMS PDFs are typically password-protected with your PAN number in lowercase
              </p>
            </div>
          )}
        </div>

        {/* CAMS Online Download Guide */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            How to Download Your CAMS Statement
          </h4>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-md p-3 border border-blue-100">
              <p className="font-medium text-blue-900 mb-2">📥 Quick Download Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                <li>Click the button below to open CAMS online in a new tab</li>
                <li>Enter your <strong>Email Address</strong> registered with mutual funds</li>
                <li>Set a <strong>Password</strong> to protect your statement file</li>
                <li>Download the statement and upload it here</li>
              </ol>
            </div>
            <div className="text-center">
              <a
                href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <Upload className="h-4 w-4" />
                Download from CAMS Online
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="text-xs text-gray-500 mt-2">Opens in a new window</p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Supported formats: PDF and Excel (.xlsx, .xls)</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Maximum file size: 10MB</span>
          </p>
          <p className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Alternative: Email requestcams@camsonline.com to request your statement</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
