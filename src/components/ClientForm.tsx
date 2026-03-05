import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { Client } from "../types";

interface Props {
  visible: boolean;
  onHide: () => void;
  client?: Client;
}

export default function ClientForm({ visible, onHide, client }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dueDay, setDueDay] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setDueDay(client.dueDay);
      setDescription(client.description);
    } else {
      setName("");
      setPhone("");
      setDueDay(null);
      setDescription("");
    }
  }, [client, visible]);

  const reset = () => {
    setName("");
    setPhone("");
    setDueDay(null);
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !dueDay || !description.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atencao",
        detail: "Preencha todos os campos",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      if (client) {
        await updateDoc(doc(db, "clients", client.id), {
          name: name.trim(),
          phone: phone.trim(),
          dueDay,
          description: description.trim(),
        });
      } else {
        await addDoc(collection(db, "clients"), {
          name: name.trim(),
          phone: phone.trim(),
          dueDay,
          description: description.trim(),
          createdAt: Timestamp.now(),
        });
      }
      reset();
      onHide();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar cliente",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
    reset();
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={client ? "Editar Cliente" : "Novo Cliente"}
        visible={visible}
        onHide={handleHide}
        style={{ width: "90vw", maxWidth: "420px" }}
        modal
      >
        <div className="form-fields">
          <div className="field">
            <label htmlFor="cf-name">Nome</label>
            <InputText
              id="cf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="cf-phone">Telefone (WhatsApp)</label>
            <InputMask
              id="cf-phone"
              value={phone}
              onChange={(e) => setPhone(e.value ?? "")}
              placeholder="(99) 9 9999-9999"
              mask="(99) 9 9999-9999"
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="cf-description">Descrição</label>
            <InputText
              id="cf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="w-full"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="cf-day">Dia do Vencimento</label>
            <InputNumber
              id="cf-day"
              value={dueDay}
              onValueChange={(e) => setDueDay(e.value ?? null)}
              min={1}
              max={31}
              placeholder="Ex: 10"
              className="w-full"
            />
            <small className="field-hint">
              Todo mes nesse dia o plano vence
            </small>
          </div>
          <Button
            label="Salvar Cliente"
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={loading}
            className="w-full"
          />
        </div>
      </Dialog>
    </>
  );
}
