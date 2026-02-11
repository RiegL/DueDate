import { Button } from "primereact/button";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const salvar = async () => {
    await addDoc(collection(db, "clients"), {
      nome: "Prime + Firebase",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <Button label="Salvar no Firestore" onClick={salvar} />
    </div>
  );
}

export default App;
