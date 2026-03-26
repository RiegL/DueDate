import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Button } from "primereact/button";
import { db } from "./firebase";
import type { Client, ClientStatus } from "./types";
import { getClientStatus, STATUS_PRIORITY } from "./clientStatus";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";
import "./App.css";

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "clients"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Client[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Client, "id">),
        }));
        setClients(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  const sorted = [...clients].sort((a, b) => {
    const diff =
      STATUS_PRIORITY[getClientStatus(a)] - STATUS_PRIORITY[getClientStatus(b)];
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  const counts = clients.reduce(
    (acc, c) => {
      const s = getClientStatus(c);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<ClientStatus, number>>,
  );

  const urgent = (counts["overdue"] ?? 0) + (counts["due-today"] ?? 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div className="header-brand">
            <span className="header-icon">📋</span>
            <div>
              <h1 className="header-title">DueDate</h1>
              <p className="header-sub">Gerenciador de vencimentos</p>
            </div>
          </div>
          <div className="header-link">
            <Button
              label="Novo Cliente"
              icon="pi pi-plus"
              onClick={() => setShowForm(true)}
            />
            <a
              className="header-link-external"
              href=" http://lookdefense.top"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="pi pi-external-link" />
              Painel de contas
            </a>
          </div>
        </div>

        {clients.length > 0 && (
          <div className="stats-row">
            {(counts["overdue"] ?? 0) > 0 && (
              <span className="stat danger">
                {counts["overdue"]} vencido{counts["overdue"]! > 1 ? "s" : ""}
              </span>
            )}
            {(counts["due-today"] ?? 0) > 0 && (
              <span className="stat danger">
                {counts["due-today"]} vence hoje
              </span>
            )}
            {(counts["due-soon"] ?? 0) > 0 && (
              <span className="stat warning">
                {counts["due-soon"]} vence em breve
              </span>
            )}
            {(counts["paid"] ?? 0) > 0 && (
              <span className="stat success">
                {counts["paid"]} pago{counts["paid"]! > 1 ? "s" : ""}
              </span>
            )}
            {urgent === 0 && <span className="stat success">Tudo em dia</span>}
            <span className="stat neutral">{clients.length} clientes</span>
          </div>
        )}
      </header>

      <main className="app-main">
        {loading && <p className="state-msg">Carregando...</p>}

        {!loading && clients.length === 0 && (
          <div className="empty-state">
            <i className="pi pi-users" />
            <p>Nenhum cliente cadastrado ainda</p>
            <Button
              label="Adicionar primeiro cliente"
              icon="pi pi-plus"
              onClick={() => setShowForm(true)}
            />
          </div>
        )}

        {!loading && clients.length > 0 && <ClientList clients={sorted} />}
      </main>

      <ClientForm visible={showForm} onHide={() => setShowForm(false)} />
    </div>
  );
}
