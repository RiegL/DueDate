import { useRef, useState } from "react";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { Client } from "../types";
import {
  getClientStatus,
  STATUS_LABEL,
  STATUS_SEVERITY,
  formatDueDate,
  getWhatsAppUrl,
} from "../clientStatus";
import ClientForm from "./ClientForm";

interface Props {
  clients: Client[];
}

function ClientCard({ client }: { client: Client }) {
  const toast = useRef<Toast>(null);
  const status = getClientStatus(client);
  const [editVisible, setEditVisible] = useState(false);

  const markAsPaid = async () => {
    try {
      await updateDoc(doc(db, "clients", client.id), {
        lastPaidAt: Timestamp.now(),
      });
      toast.current?.show({
        severity: "success",
        summary: "Pago!",
        detail: `${client.name} marcado como pago`,
        life: 2000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao atualizar",
        life: 3000,
      });
    }
  };

  const sendReminder = async () => {
    window.open(
      getWhatsAppUrl(client.phone, client.name, client.dueDay),
      "_blank",
    );
    try {
      await updateDoc(doc(db, "clients", client.id), {
        lastReminderSentAt: Timestamp.now(),
      });
    } catch {
      // silently fail
    }
  };

  const handleDelete = () => {
    confirmDialog({
      message: `Deseja excluir ${client.name}?`,
      header: "Confirmar exclusao",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Excluir",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteDoc(doc(db, "clients", client.id));
        } catch {
          toast.current?.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao excluir",
            life: 3000,
          });
        }
      },
    });
  };

  const fmt = (ts?: Timestamp) => {
    if (!ts) return "—";
    return ts.toDate().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ClientForm
        visible={editVisible}
        onHide={() => setEditVisible(false)}
        client={client}
      />
      <div className={`client-card status-${status}`}>
        <div className="card-header">
          <Tag
            value={STATUS_LABEL[status]}
            severity={STATUS_SEVERITY[status]}
          />
          <Button
            icon="pi pi-pencil"
            rounded
            text
            severity="secondary"
            size="small"
            onClick={() => setEditVisible(true)}
            aria-label="Editar cliente"
          />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            size="small"
            onClick={handleDelete}
            aria-label="Excluir cliente"
          />
        </div>

        <div className="card-name">{client.name}</div>

        <div className="card-description">
          <i className="pi pi-copy" /> {client.description}
        </div>

        <div className="card-phone">
          <i className="pi pi-phone" />
          {client.phone}
        </div>

        <div className="card-due">
          <i className="pi pi-calendar" />
          Vence todo dia <strong>{client.dueDay}</strong>
          <span className="due-date">
            {" "}
            &middot; {formatDueDate(client.dueDay)}
          </span>
        </div>

        <div className="card-meta">
          <span>Pago: {fmt(client.lastPaidAt)}</span>
          <span>Lembrete: {fmt(client.lastReminderSentAt)}</span>
        </div>

        <div className="card-actions">
          <Button
            label="Marcar Pago"
            icon="pi pi-check"
            severity="success"
            size="small"
            disabled={status === "paid"}
            onClick={markAsPaid}
          />
          <Button
            label="Enviar Lembrete"
            icon="pi pi-whatsapp"
            severity="secondary"
            size="small"
            onClick={sendReminder}
          />
        </div>
      </div>
    </>
  );
}

export default function ClientList({ clients }: Props) {
  return (
    <>
      <ConfirmDialog />
      <div className="clients-grid">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </>
  );
}
