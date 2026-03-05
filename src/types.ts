import { Timestamp } from "firebase/firestore";

export interface Client {
  id: string;
  name: string;
  phone: string;
  dueDay: number;
  createdAt: Timestamp;
  lastPaidAt?: Timestamp;
  lastReminderSentAt?: Timestamp;
  description: string;
}

export type ClientStatus = "paid" | "overdue" | "due-today" | "due-soon" | "ok";
