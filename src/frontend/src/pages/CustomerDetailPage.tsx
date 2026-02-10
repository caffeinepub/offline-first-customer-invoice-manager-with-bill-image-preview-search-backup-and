import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getCustomer, updateCustomer, deleteCustomer } from '@/lib/offline/repository';
import { Customer } from '@/lib/offline/models';
import CustomerForm from '@/components/customers/CustomerForm';
import CustomerInvoicesPanel from '@/components/customers/CustomerInvoicesPanel';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { customerId } = useParams({ from: '/customers/$customerId' });
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadCustomer = async () => {
    const data = await getCustomer(customerId);
    setCustomer(data);
  };

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const handleUpdate = async (data: { name: string; phone?: string; email?: string; address?: string; notes?: string }) => {
    try {
      await updateCustomer(customerId, data);
      toast.success('Customer updated successfully');
      setIsEditOpen(false);
      loadCustomer();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId);
      toast.success('Customer deleted successfully');
      navigate({ to: '/customers' });
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  if (!customer) {
    return (
      <div className="container max-w-2xl px-4 py-6">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/customers' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{customer.name}</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="break-all">{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-wrap">{customer.address}</span>
            </div>
          )}
          {customer.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-wrap text-muted-foreground">{customer.notes}</span>
            </div>
          )}
          {!customer.phone && !customer.email && !customer.address && !customer.notes && (
            <p className="text-sm text-muted-foreground">No additional information</p>
          )}
        </CardContent>
      </Card>

      <CustomerInvoicesPanel customerId={customerId} />

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CustomerForm
              customer={customer}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer.name} and all associated invoices and images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
