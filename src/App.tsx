import { useState } from 'react';
import QRCode from 'react-qr-code';

function generateRandomString(length = 40) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type SavedQR = {
  value: string;
  label: string;
};

function App() {
  const [current, setCurrent] = useState(generateRandomString());
  const [saved, setSaved] = useState<SavedQR[]>([]);
  const [labelInput, setLabelInput] = useState("");

  const handleNext = () => {
    setCurrent(generateRandomString());
    setLabelInput("");
  }

  const handleSave = () => {
    if (!labelInput.trim()) return;
    setSaved([...saved, {value: current, label: labelInput}]);
    handleNext();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">QR Generator</h1>

      <div className="border p-4 w-fit">
        <QRCode value={current}/>
        <p>Value: {current}</p>
      </div>

      <div>
        <input
          type="text"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          placeholder="気に入ったらラベルを入力"
          className="border px-2 py-1"
        />
        <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1">保存</button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-3 py-1">次へ</button>
      </div>

      <div>
        <h2 className="font-semibold mt-4">保存済み:</h2>
        <ul className="mt-2 space-y-2">
          {saved.map((item, idx) => (
            <li key={idx} className="flex items-center space-x-4">
              <QRCode value={item.value} size={64}/>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
