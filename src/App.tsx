import { useEffect, useState } from "react";
import { addClient, fetchClients, type Client } from "./services/clients";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";

function App() {
  const [clients, setClients] = useState<Client[]>([]);

  const load = async () => {
    const data = await fetchClients();
    setClients(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (c: {
    name: string;
    phone: string;
    dueDay: number;
  }) => {
    await addClient(c);
    await load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cadastro de Clientes</h2>
      <ClientForm onAdd={handleAdd} />
      <ClientList clients={clients} onUpdated={load} />
    </div>
  );
}

export default App;
