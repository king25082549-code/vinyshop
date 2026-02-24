import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { OrderForm } from '@/components/OrderForm';
import { OrdersList } from '@/components/OrdersList';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Inventory } from '@/components/Inventory';
import { Finance } from '@/components/Finance';
import { Staff } from '@/components/Staff';
import { SettingsPage } from '@/components/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'order':
        return <OrderForm onSuccess={() => setCurrentPage('orders')} />;
      case 'orders':
        return <OrdersList />;
      case 'kanban':
        return <KanbanBoard />;
      case 'inventory':
        return <Inventory />;
      case 'finance':
        return <Finance />;
      case 'staff':
        return <Staff />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
