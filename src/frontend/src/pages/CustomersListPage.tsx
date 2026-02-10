import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getAllCustomers, createCustomer } from '@/lib/offline/repository';
import { Customer } from '@/lib/offline/models';
import CustomerSearchBar from '@/components/customers/CustomerSearchBar';
import CustomerForm from '@/components/customers/CustomerForm';
import { Plus, User } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustomer = async (data: { name: string; phone?: string; email?: string; address?: string; notes?: string }) => {
    try {
      await createCustomer(data);
      toast.success('Customer created successfully');
      setIsCreateOpen(false);
      loadCustomers();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Customer</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <CustomerForm
                onSubmit={handleCreateCustomer}
                onCancel={() => setIsCreateOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <CustomerSearchBar value={searchQuery} onChange={setSearchQuery} />

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No customers found matching your search' : 'No customers yet. Add your first customer above.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => navigate({ to: '/customers/$customerId', params: { customerId: customer.id } })}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  )}
                  {customer.email && (
                    <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
