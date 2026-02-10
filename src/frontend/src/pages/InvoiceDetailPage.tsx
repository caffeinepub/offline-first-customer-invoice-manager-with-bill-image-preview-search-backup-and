import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getInvoice, getCustomer, getImage } from '@/lib/offline/repository';
import { Invoice, Customer } from '@/lib/offline/models';
import { downloadBlob } from '@/lib/downloads/downloadUtils';
import { downloadInvoiceImagesBundle } from '@/lib/downloads/invoiceImageBundle';
import { ArrowLeft, Download, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams({ from: '/invoices/$invoiceId' });
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [imageUrls, setImageUrls] = useState<{ id: string; url: string; filename: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const invoiceData = await getInvoice(invoiceId);
      if (invoiceData) {
        setInvoice(invoiceData);
        
        const customerData = await getCustomer(invoiceData.customerId);
        setCustomer(customerData);

        const urls = await Promise.all(
          invoiceData.imageIds.map(async (id) => {
            const img = await getImage(id);
            if (img) {
              return {
                id,
                url: URL.createObjectURL(img.blob),
                filename: img.filename,
              };
            }
            return null;
          })
        );
        setImageUrls(urls.filter((u): u is { id: string; url: string; filename: string } => u !== null));
      }
    };

    loadData();

    return () => {
      imageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [invoiceId]);

  const handleDownloadImage = async (imageId: string, filename: string) => {
    try {
      const img = await getImage(imageId);
      if (img) {
        downloadBlob(img.blob, filename);
        toast.success('Image downloaded');
      }
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleDownloadAllImages = async () => {
    if (!invoice) return;
    
    try {
      await downloadInvoiceImagesBundle(invoice.imageIds, invoice.invoiceNumber);
      toast.success('All images downloaded');
    } catch (error) {
      toast.error('Failed to download images');
    }
  };

  if (!invoice || !customer) {
    return (
      <div className="container max-w-2xl px-4 py-6">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/customers/$customerId', params: { customerId: customer.id } })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{invoice.invoiceNumber}</h1>
        <Badge className={getStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(invoice.date).toLocaleDateString()}</span>
          </div>
          {invoice.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span className="text-right">{invoice.description}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold">${invoice.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {imageUrls.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Bill Images ({imageUrls.length})</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadAllImages}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Download All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {imageUrls.map(({ id, url, filename }) => (
                <div key={id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={url}
                    alt={filename}
                    className="h-full w-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(url)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadImage(id, filename)}
                    className="absolute bottom-2 right-2 gap-1"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full preview"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
