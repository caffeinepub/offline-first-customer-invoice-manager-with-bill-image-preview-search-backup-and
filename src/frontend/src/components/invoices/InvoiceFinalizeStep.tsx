import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

interface InvoiceFinalizeStepProps {
  invoiceNumber: string;
  total: number;
  imageCount: number;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function InvoiceFinalizeStep({
  invoiceNumber,
  total,
  imageCount,
  onConfirm,
  onBack,
  isSubmitting,
}: InvoiceFinalizeStepProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Review Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number:</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold text-lg">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Attached Images:</span>
            <span className="font-medium">{imageCount}</span>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          Once you finalize this invoice, it will be saved with all attached images. You can still edit it later.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? 'Saving...' : 'Finalize & Save Invoice'}
        </Button>
      </div>
    </div>
  );
}
