import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInvoicesByCustomer } from '@/lib/offline/repository';
import { Invoice } from '@/lib/offline/models';
import { Plus, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import InvoiceForm from '../invoices/InvoiceForm';

interface CustomerInvoicesPanelProps {
  customerId: string;
}

export default function CustomerInvoicesPanel({ customerId }: CustomerInvoicesPanelProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadInvoices = async () => {
    const data = await getInvoicesByCustomer(customerId);
    setInvoices(data);
  };

  useEffect(() => {
    loadInvoices();
  }, [customerId]);

  const handleInvoiceCreated = () => {
    setIsCreateOpen(false);
    loadInvoices();
  };

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Invoices</CardTitle>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create Invoice</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <InvoiceForm customerId={customerId} onSuccess={handleInvoiceCreated} />
            </div>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No invoices yet. Create your first invoice above.
          </p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => navigate({ to: '/invoices/$invoiceId', params: { invoiceId: invoice.id } })}
                className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${invoice.total.toFixed(2)}</p>
                    <Badge className={`mt-1 ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
