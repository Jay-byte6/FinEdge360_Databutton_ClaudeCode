import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usePortfolioStore from '@/utils/portfolioStore';
import useAuthStore from '@/utils/authStore';

export const PortfolioUploadCard = () => {
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
    await uploadStatement(file, user.id, password);
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
            <span>Get your CAMS statement by emailing requestcams@camsonline.com or download from CAMS website</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
