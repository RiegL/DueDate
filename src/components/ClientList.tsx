import type { Client } from "../services/clients";
import { markPaidThisMonth } from "../services/clients";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

export type Props = {
  clients: Client[];
  onUpdated?: () => void; // callback to refresh list
};

function computeStatus(client: Client): string {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  if (client.paidUntil && client.paidUntil >= endOfMonth) {
    return "OK";
  }

  const dueThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    client.dueDay,
  );
  // if due day beyond last day of month, fallback to last day
  const monthLast = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  if (client.dueDay > monthLast) {
    dueThisMonth.setDate(monthLast);
  }

  if (today > dueThisMonth) {
    return "vencido";
  }

  const diff =
    (dueThisMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 3) {
    return "vencendo";
  }

  return "normal";
}

export default function ClientList({ clients, onUpdated }: Props) {
  const statusBody = (rowData: Client) => {
    const status = computeStatus(rowData);
    let color = "inherit";
    if (status === "vencido")
      color = "#d32f2f"; // red
    else if (status === "vencendo")
      color = "#ed6c02"; // orange
    else if (status === "OK") color = "#2e7d32"; // green
    return <span style={{ color }}>{status}</span>;
  };

  const actionBody = (rowData: Client) => {
    const phoneLink = `https://wa.me/${rowData.phone.replace(/[^0-9]/g, "")}`;
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          icon="pi pi-whatsapp"
          className="p-button-success p-button-sm"
          aria-label="WhatsApp"
          onClick={() => window.open(phoneLink, "_blank")}
        />
        <Button
          label="Pago"
          className="p-button-info p-button-sm"
          onClick={async () => {
            await markPaidThisMonth(rowData.id);
            onUpdated && onUpdated();
          }}
        />
      </div>
    );
  };

  return (
    <DataTable value={clients} stripedRows responsiveLayout="scroll">
      <Column field="name" header="Nome" />
      <Column field="phone" header="Telefone" />
      <Column field="dueDay" header="Dia" />
      <Column header="Status" body={statusBody} />
      <Column header="Ações" body={actionBody} />
    </DataTable>
  );
}
