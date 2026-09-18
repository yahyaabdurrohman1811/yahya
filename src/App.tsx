import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { ContainerListView } from './components/ContainerListView';
import { YardVisualizer } from './components/YardVisualizer';
import { ActivityLogView } from './components/ActivityLogView';
import { ContainerModal } from './components/ContainerModal';
import { ContainerDetailModal } from './components/ContainerDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { Container, ActivityLog, ContainerStatus } from './types';
import { 
  subscribeToContainers, 
  subscribeToActivityLogs, 
  createContainer, 
  updateContainer, 
  deleteContainer,
  seedInitialContainers
} from './services/containerService';
import { Anchor, AlertCircle, Database } from 'lucide-react';

const TerminalApp: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();

  // Real-time Firestore state
  const [containers, setContainers] = useState<Container[]>([]);
  const [containersLoading, setContainersLoading] = useState<boolean>(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(true);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  // View state
  const [activeView, setActiveView] = useState<'list' | 'yard' | 'logs'>('list');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [detailContainer, setDetailContainer] = useState<Container | null>(null);
  const [deletingContainer, setDeletingContainer] = useState<Container | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [seeding, setSeeding] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Firestore listeners
  useEffect(() => {
    if (!currentUser) return;

    setContainersLoading(true);
    setDatabaseError(null);

    // 1. Subscribe to Containers collection
    const unsubContainers = subscribeToContainers(
      (data) => {
        setContainers(data);
        setContainersLoading(false);
      },
      (err) => {
        setDatabaseError('Gagal menyinkronkan data kontainer dari Firestore: ' + err.message);
        setContainersLoading(false);
        addToast('error', 'Koneksi Database Terkendala', err.message);
      }
    );

    // 2. Subscribe to Activity Logs
    const unsubLogs = subscribeToActivityLogs(
      (logs) => {
        setActivityLogs(logs);
        setLogsLoading(false);
      },
      (err) => {
        console.warn('Gagal membaca log aktivitas:', err);
        setLogsLoading(false);
      }
    );

    return () => {
      unsubContainers();
      unsubLogs();
    };
  }, [currentUser]);

  // Keep detailContainer updated if containers list updates
  useEffect(() => {
    if (detailContainer) {
      const refreshed = containers.find((c) => c.id === detailContainer.id);
      if (refreshed) {
        setDetailContainer(refreshed);
      }
    }
  }, [containers]);

  // CRUD Actions
  const handleCreateContainer = async (data: any) => {
    const operatorEmail = currentUser?.email || 'operator@terminal.id';
    await createContainer(data, operatorEmail);
    addToast(
      'success',
      'Peti Kemas Berhasil Diregistrasi',
      `Kontainer ${data.containerNumber} telah berhasil disimpan ke database Firestore di Blok ${data.yardBlock}-${data.yardBay}.`
    );
  };

  const handleUpdateContainer = async (data: any) => {
    if (!editingContainer?.id) return;
    const operatorEmail = currentUser?.email || 'operator@terminal.id';
    await updateContainer(editingContainer.id, data, operatorEmail);
    addToast(
      'success',
      'Data Peti Kemas Diperbarui',
      `Perubahan informasi peti kemas ${editingContainer.containerNumber} berhasil disimpan secara persisten.`
    );
    setEditingContainer(null);
  };

  const handleDeleteContainer = async (id: string, containerNumber: string, reason: string) => {
    const operatorEmail = currentUser?.email || 'operator@terminal.id';
    await deleteContainer(id, containerNumber, operatorEmail, reason);
    addToast(
      'success',
      'Peti Kemas Dihapus',
      `Nomor peti kemas ${containerNumber} telah dihapus dari database. Log audit dicatat.`
    );
  };

  const handleQuickStatusChange = async (container: Container, nextStatus: ContainerStatus) => {
    if (!container.id) return;
    const operatorEmail = currentUser?.email || 'operator@terminal.id';
    try {
      await updateContainer(
        container.id,
        { status: nextStatus },
        operatorEmail,
        `Perubahan cepat alur operasional: ${container.status} → ${nextStatus}`
      );
      addToast(
        'info',
        'Status Lapangan Berubah',
        `Peti kemas ${container.containerNumber} sekarang berstatus ${nextStatus}.`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Mengubah Status', err.message);
    }
  };

  const handleSeedInitialData = async () => {
    setSeeding(true);
    const operatorEmail = currentUser?.email || 'system@terminal.id';
    try {
      const count = await seedInitialContainers(operatorEmail);
      if (count > 0) {
        addToast(
          'success',
          'Database Siap Pakai',
          `Berhasil memuat ${count} data peti kemas percontohan ke dalam real database Firestore.`
        );
      } else {
        addToast(
          'info',
          'Database Sudah Berisi Data',
          'Data kontainer sudah tersedia di Firestore.'
        );
      }
    } catch (err: any) {
      addToast('error', 'Gagal Mengisi Data', err.message);
    } finally {
      setSeeding(false);
    }
  };

  // 1. Initial Authentication Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse mb-4">
          <Anchor className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Memeriksa Otentikasi Operator...</h2>
        <p className="text-xs text-slate-500 mt-1">Menghubungkan ke Firebase Auth & Firestore</p>
      </div>
    );
  }

  // 2. Default View when not logged in: Strict Login Form
  if (!currentUser) {
    return <LoginForm />;
  }

  // 3. Authenticated Terminal Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        containerCount={containers.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Database Error Banner if any */}
        {databaseError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Koneksi Database Bermasalah:</span> {databaseError}
            </div>
            <button
              onClick={() => setDatabaseError(null)}
              className="px-2.5 py-1 text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Dynamic Views */}
        {activeView === 'list' && (
          <ContainerListView
            containers={containers}
            loading={containersLoading}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onViewDetail={(c) => setDetailContainer(c)}
            onEdit={(c) => setEditingContainer(c)}
            onDelete={(c) => setDeletingContainer(c)}
            onQuickStatusChange={handleQuickStatusChange}
            onSeedInitialData={handleSeedInitialData}
            seeding={seeding}
          />
        )}

        {activeView === 'yard' && (
          <YardVisualizer
            containers={containers}
            onSelectContainer={(c) => setDetailContainer(c)}
          />
        )}

        {activeView === 'logs' && (
          <ActivityLogView
            logs={activityLogs}
            loading={logsLoading}
          />
        )}
      </main>

      {/* Modal: Create Container */}
      <ContainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateContainer}
        mode="create"
      />

      {/* Modal: Edit Container */}
      <ContainerModal
        isOpen={editingContainer !== null}
        onClose={() => setEditingContainer(null)}
        onSave={handleUpdateContainer}
        initialData={editingContainer}
        mode="edit"
      />

      {/* Modal: Detail Container / Tally Sheet */}
      <ContainerDetailModal
        isOpen={detailContainer !== null}
        container={detailContainer}
        onClose={() => setDetailContainer(null)}
        onEdit={(c) => {
          setDetailContainer(null);
          setEditingContainer(c);
        }}
        onDelete={(c) => {
          setDetailContainer(null);
          setDeletingContainer(c);
        }}
      />

      {/* Modal: Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deletingContainer !== null}
        container={deletingContainer}
        onClose={() => setDeletingContainer(null)}
        onConfirmDelete={handleDeleteContainer}
      />

      {/* Real-time Toast Notifications */}
      <NotificationToast
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TerminalApp />
    </AuthProvider>
  );
}
