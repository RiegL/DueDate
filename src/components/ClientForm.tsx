import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

type FormProps = {
  onAdd: (data: { name: string; phone: string; dueDay: number }) => void;
};

export default function ClientForm({ onAdd }: FormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dueDay, setDueDay] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !phone.trim() ||
      dueDay === null ||
      dueDay < 1 ||
      dueDay > 31
    ) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    onAdd({ name: name.trim(), phone: phone.trim(), dueDay });
    setName("");
    setPhone("");
    setDueDay(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginBottom: 24 }}>
      <div className="p-field">
        <label htmlFor="name">Nome</label>
        <InputText
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do cliente"
        />
      </div>
      <div className="p-field">
        <label htmlFor="phone">Telefone</label>
        <InputText
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(99)99999-9999"
        />
      </div>
      <div className="p-field">
        <label htmlFor="dueDay">Dia do vencimento</label>
        <InputNumber
          id="dueDay"
          value={dueDay}
          onValueChange={(e) => setDueDay(e.value as number)}
          min={1}
          max={31}
          showButtons
        />
      </div>
      <Button type="submit" label="Adicionar cliente" />
    </form>
  );
}
