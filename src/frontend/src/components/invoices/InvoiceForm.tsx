import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateInvoiceNumber, validateInvoiceTotal } from '@/lib/validation/validators';
import { createInvoice, saveImage } from '@/lib/offline/repository';
import { Invoice } from '@/lib/offline/models';
import ErrorBanner from '../common/ErrorBanner';
import ImagePreviewGallery from './ImagePreviewGallery';
import InvoiceFinalizeStep from './InvoiceFinalizeStep';
import { Upload } from 'lucide-react';

interface InvoiceFormProps {
  customerId: string;
  invoice?: Invoice;
  onSuccess: () => void;
}

export default function InvoiceForm({ customerId, invoice, onSuccess }: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber || '');
  const [date, setDate] = useState(invoice ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(invoice?.description || '');
  const [total, setTotal] = useState(invoice?.total.toString() || '');
  const [status, setStatus] = useState<Invoice['status']>(invoice?.status || 'draft');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleProceedToFinalize = () => {
    setError(null);

    const numberError = validateInvoiceNumber(invoiceNumber);
    if (numberError) {
      setError(numberError);
      return;
    }

    const totalNum = parseFloat(total);
    const totalError = validateInvoiceTotal(totalNum);
    if (totalError) {
      setError(totalError);
      return;
    }

    setShowFinalize(true);
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newInvoice = await createInvoice({
        customerId,
        invoiceNumber: invoiceNumber.trim(),
        date: new Date(date).getTime(),
        description: description.trim() || undefined,
        lineItems: [],
        total: parseFloat(total),
        status,
        imageIds: [],
      });

      // Save images
      const imageIds: string[] = [];
      for (const file of selectedFiles) {
        const imageId = await saveImage(newInvoice.id, file, file.name);
        imageIds.push(imageId);
      }

      // Update invoice with image IDs
      if (imageIds.length > 0) {
        await createInvoice({
          ...newInvoice,
          imageIds,
        });
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      setShowFinalize(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFinalize) {
    return (
      <InvoiceFinalizeStep
        invoiceNumber={invoiceNumber}
        total={parseFloat(total)}
        imageCount={selectedFiles.length}
        onConfirm={handleFinalize}
        onBack={() => setShowFinalize(false)}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <div className="space-y-2">
        <Label htmlFor="invoiceNumber">Invoice Number *</Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="INV-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Invoice description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="total">Total Amount *</Label>
        <Input
          id="total"
          type="number"
          step="0.01"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as Invoice['status'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Bill Images</Label>
        <div className="flex items-center gap-2">
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('images')?.click()}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            Select Images ({selectedFiles.length})
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <ImagePreviewGallery files={selectedFiles} onRemove={handleRemoveImage} />
      )}

      <Button onClick={handleProceedToFinalize} className="w-full" size="lg">
        Review & Finalize Invoice
      </Button>
    </div>
  );
}
