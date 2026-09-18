import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  writeBatch,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Container, ActivityLog } from '../types';
import { normalizeContainerNumber } from '../utils/validators';

const CONTAINERS_COLLECTION = 'containers';
const LOGS_COLLECTION = 'activity_logs';

/**
 * Mendengarkan data peti kemas secara real-time dari Firestore
 */
export function subscribeToContainers(
  onUpdate: (containers: Container[]) => void,
  onError: (error: Error) => void
) {
  const containersRef = collection(db, CONTAINERS_COLLECTION);
  const q = query(containersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Container[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Container, 'id'>)
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error fetching containers:', err);
      onError(err);
    }
  );
}

/**
 * Mendengarkan audit log aktivitas terminal
 */
export function subscribeToActivityLogs(
  onUpdate: (logs: ActivityLog[]) => void,
  onError: (error: Error) => void
) {
  const logsRef = collection(db, LOGS_COLLECTION);
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ActivityLog, 'id'>)
        });
      });
      onUpdate(logs);
    },
    (err) => {
      console.error('Error fetching logs:', err);
      onError(err);
    }
  );
}

/**
 * Mencatat log aktivitas ke Firestore
 */
export async function logActivity(log: Omit<ActivityLog, 'id'>) {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), log);
  } catch (err) {
    console.warn('Gagal menyimpan activity log ke Firestore:', err);
  }
}

/**
 * CREATE: Tambah data Peti Kemas baru ke Firestore
 */
export async function createContainer(
  containerData: Omit<Container, 'id' | 'createdAt' | 'updatedAt' | 'payloadWeight'>,
  operatorEmail: string
): Promise<string> {
  const normalizedNumber = normalizeContainerNumber(containerData.containerNumber);
  const now = new Date().toISOString();
  const payloadWeight = Math.max(0, containerData.grossWeight - containerData.tareWeight);

  const newRecord: Omit<Container, 'id'> = {
    ...containerData,
    containerNumber: normalizedNumber,
    payloadWeight,
    createdAt: now,
    updatedAt: now,
    updatedBy: operatorEmail,
  };

  const docRef = await addDoc(collection(db, CONTAINERS_COLLECTION), newRecord);

  // Catat audit trail ke Firestore
  await logActivity({
    action: 'CREATE',
    containerNumber: normalizedNumber,
    operator: operatorEmail,
    details: `Registrasi peti kemas baru [${containerData.isoType} - ${containerData.shippingLine}], Status: ${containerData.status}, Lokasi Yard: ${containerData.yardBlock}-${containerData.yardBay}-${containerData.yardRow}-${containerData.yardTier}`,
    timestamp: now,
  });

  return docRef.id;
}

/**
 * UPDATE: Perbarui data Peti Kemas di Firestore
 */
export async function updateContainer(
  id: string,
  containerData: Partial<Container>,
  operatorEmail: string,
  summaryNote?: string
): Promise<void> {
  const docRef = doc(db, CONTAINERS_COLLECTION, id);
  const now = new Date().toISOString();

  const updates: Record<string, any> = {
    ...containerData,
    updatedAt: now,
    updatedBy: operatorEmail,
  };

  if (containerData.containerNumber) {
    updates.containerNumber = normalizeContainerNumber(containerData.containerNumber);
  }

  if (containerData.grossWeight !== undefined && containerData.tareWeight !== undefined) {
    updates.payloadWeight = Math.max(0, containerData.grossWeight - containerData.tareWeight);
  }

  await updateDoc(docRef, updates);

  // Catat audit log
  await logActivity({
    action: 'UPDATE',
    containerNumber: containerData.containerNumber || 'ID:' + id,
    operator: operatorEmail,
    details: summaryNote || `Pembaruan data peti kemas (Status: ${containerData.status || 'Tetap'}, Yard: ${containerData.yardBlock || ''}-${containerData.yardBay || ''})`,
    timestamp: now,
  });
}

/**
 * DELETE: Hapus data Peti Kemas dari Firestore
 */
export async function deleteContainer(
  id: string,
  containerNumber: string,
  operatorEmail: string,
  reason: string
): Promise<void> {
  const docRef = doc(db, CONTAINERS_COLLECTION, id);
  await deleteDoc(docRef);

  const now = new Date().toISOString();
  await logActivity({
    action: 'DELETE',
    containerNumber,
    operator: operatorEmail,
    details: `Penghapusan peti kemas dari database. Alasan: ${reason || 'Tidak ada alasan khusus'}`,
    timestamp: now,
  });
}

/**
 * Inisialisasi Data Demo Awal ke Firestore (Hanya jika Firestore masih kosong)
 */
export async function seedInitialContainers(operatorEmail: string): Promise<number> {
  const containersRef = collection(db, CONTAINERS_COLLECTION);
  const existingDocs = await getDocs(query(containersRef, limit(1)));
  
  if (!existingDocs.empty) {
    return 0; // Sudah ada data
  }

  const batch = writeBatch(db);
  const now = new Date();

  const initialItems: Omit<Container, 'id'>[] = [
    {
      containerNumber: 'MSKU8941203',
      isoType: '40HC',
      size: '40ft',
      status: 'YARD STACK',
      category: 'IMPOR',
      shippingLine: 'Maersk',
      grossWeight: 28450,
      tareWeight: 3980,
      payloadWeight: 24470,
      sealNumber: 'MSK-7749102',
      vesselName: 'MV MAERSK MC-KINNEY MOLLER',
      voyageNumber: 'V.2501E',
      consignee: 'PT Astra International Tbk',
      yardBlock: 'B',
      yardBay: '12',
      yardRow: '03',
      yardTier: '2',
      isReefer: false,
      isHazardous: false,
      notes: 'Kargo sparepart otomotif, kondisi peti kemas bersih prima.',
      truckPlate: 'B 9482 TEI',
      createdAt: new Date(now.getTime() - 3600000 * 8).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 8).toISOString(),
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'CMAU1093845',
      isoType: '20RF',
      size: '20ft',
      status: 'YARD STACK',
      category: 'EKSPOR',
      shippingLine: 'CMA CGM',
      grossWeight: 21500,
      tareWeight: 2950,
      payloadWeight: 18550,
      sealNumber: 'CMA-992140',
      vesselName: 'CMA CGM CORTE REAL',
      voyageNumber: 'FE-0492',
      consignee: 'PT Indofood CBP Sukses Makmur',
      yardBlock: 'R',
      yardBay: '04',
      yardRow: '02',
      yardTier: '1',
      isReefer: true,
      reeferTemp: -18.5,
      isHazardous: false,
      notes: 'Peti kemas pendingin muatan daging beku ekspor, suhu stabil di -18.5°C.',
      truckPlate: 'B 9102 UV',
      createdAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'ONEU5521980',
      isoType: '40GP',
      size: '40ft',
      status: 'GATE IN',
      category: 'EKSPOR',
      shippingLine: 'ONE',
      grossWeight: 26800,
      tareWeight: 3750,
      payloadWeight: 23050,
      sealNumber: 'ONE-482019',
      vesselName: 'ONE APUS',
      voyageNumber: 'JP-2509',
      consignee: 'PT Sri Rejeki Isman Tbk',
      yardBlock: 'A',
      yardBay: '08',
      yardRow: '04',
      yardTier: '1',
      isReefer: false,
      isHazardous: false,
      notes: 'Baru masuk gerbang Terminal Peti Kemas, menunggu instruksi stack.',
      truckPlate: 'B 9044 XY',
      createdAt: new Date(now.getTime() - 3600000 * 2).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 2).toISOString(),
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'EGLU7812044',
      isoType: '40HC',
      size: '40ft',
      status: 'LOADING',
      category: 'TRANSSHIPMENT',
      shippingLine: 'Evergreen',
      grossWeight: 31200,
      tareWeight: 4020,
      payloadWeight: 27180,
      sealNumber: 'EGL-559103',
      vesselName: 'EVER GIVEN',
      voyageNumber: 'EG-8812',
      consignee: 'Samsung Electronics Indonesia',
      yardBlock: 'A',
      yardBay: '02',
      yardRow: '01',
      yardTier: '3',
      isReefer: false,
      isHazardous: false,
      notes: 'Proses muat ke kapal (Quayside Crane No. 04 aktif).',
      truckPlate: 'B 9711 QP',
      createdAt: new Date(now.getTime() - 3600000 * 12).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 1).toISOString(),
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'MEDU6721098',
      isoType: '20GP',
      size: '20ft',
      status: 'INSPECTION',
      category: 'IMPOR',
      shippingLine: 'MSC',
      grossWeight: 19800,
      tareWeight: 2300,
      payloadWeight: 17500,
      sealNumber: 'MSC-003921',
      vesselName: 'MSC OSCAR',
      voyageNumber: 'EU-901',
      consignee: 'PT Mayora Indah Tbk',
      yardBlock: 'H',
      yardBay: '01',
      yardRow: '02',
      yardTier: '1',
      isReefer: false,
      isHazardous: true,
      imoClass: 'Class 3 - Flammable Liquids',
      notes: 'Pemeriksaan Bea Cukai (Jalur Merah) & karantina bahan kimia pelarut.',
      truckPlate: 'B 9382 AB',
      createdAt: new Date(now.getTime() - 3600000 * 18).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 3).toISOString(),
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'SAMU3041952',
      isoType: '20GP',
      size: '20ft',
      status: 'YARD STACK',
      category: 'EMPTY',
      shippingLine: 'Samudera Indonesia',
      grossWeight: 2280,
      tareWeight: 2280,
      payloadWeight: 0,
      sealNumber: 'EMPTY-SEAL',
      vesselName: 'KM SINAR PRAYA',
      voyageNumber: 'DOM-110',
      consignee: 'Depo Peti Kemas Marunda',
      yardBlock: 'C',
      yardBay: '05',
      yardRow: '01',
      yardTier: '4',
      isReefer: false,
      isHazardous: false,
      notes: 'Peti kemas kosong siap reposisi untuk kebutuhan ekspor komoditas lokal.',
      truckPlate: 'B 9552 ZK',
      createdAt: new Date(now.getTime() - 3600000 * 24).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000 * 6).toISOString(),
      updatedBy: operatorEmail,
    }
  ];

  initialItems.forEach((item) => {
    const newDocRef = doc(containersRef);
    batch.set(newDocRef, item);
  });

  await batch.commit();

  await logActivity({
    action: 'CREATE',
    containerNumber: 'BATCH-SEED',
    operator: operatorEmail,
    details: `Inisialisasi database produksi terminal peti kemas dengan 6 unit kargo awal.`,
    timestamp: now.toISOString(),
  });

  return initialItems.length;
}
