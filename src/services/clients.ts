import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export type Client = {
  id: string;
  name: string;
  phone: string;
  dueDay: number; // day of month the payment is due (1-31)
  paidUntil?: Date; // optional timestamp until which the client has paid (month/year)
  createdAt?: Date;
};

const clientsCol = collection(db, "clients");

export async function fetchClients(): Promise<Client[]> {
  const snapshot = await getDocs(clientsCol);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data.name,
      phone: data.phone,
      dueDay: data.dueDay,
      paidUntil: data.paidUntil
        ? (data.paidUntil as Timestamp).toDate()
        : undefined,
      createdAt: data.createdAt
        ? (data.createdAt as Timestamp).toDate()
        : undefined,
    };
  });
}

export async function addClient(
  client: Omit<Client, "id" | "createdAt" | "paidUntil">,
) {
  return await addDoc(clientsCol, {
    name: client.name,
    phone: client.phone,
    dueDay: client.dueDay,
    createdAt: serverTimestamp(),
  });
}

/**
 * Marks the client as paid for the current month (updates paidUntil to end of this month).
 * You can customize this to whatever logic you prefer.
 */
export async function markPaidThisMonth(clientId: string) {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const docRef = doc(db, "clients", clientId);
  await updateDoc(docRef, {
    paidUntil: Timestamp.fromDate(endOfMonth),
  });
}

export async function updateClient(
  client: Partial<Omit<Client, "id">> & { id: string },
) {
  const { id, ...rest } = client;
  const docRef = doc(db, "clients", id);
  await updateDoc(docRef, rest as any);
}
