import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { addQRData, deleteQRData, subscribeQRData } from './firebase';
import type { AntennaID, ColorID, HeadID, LabelEntry, QRData } from './types';
import { antennaOptions, colorOptions, headOptions } from './options';

function generateRandomString(length = 40) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}


function App() {
  const [QRList, setQRList] = useState<QRData[]>([]);
  const [currentValue, setCurrentValue] = useState(generateRandomString());
  const [labelInput, setLabelInput] = useState<LabelEntry>({
    name: "",
    antenna: "",
    head: "",
    color: "",
    hp: "",
    evasion: "",
    notes: "",
  });
  const [labelList, setLabelList] = useState<LabelEntry[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeQRData(setQRList);
    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    setCurrentValue(generateRandomString());
    setLabelList([]);
    resetLabelInput();
  }

  const handleSave = async () => {
    const id = await addQRData(currentValue, labelList);
    console.log("保存完了 ID:", id);
  }

  const handleDelete = async (id: string) => {
    await deleteQRData(id);
  }

  const resetLabelInput = () => {
    setLabelInput({
      name: "",
      antenna: "",
      head: "",
      color: "",
      hp: "",
      evasion: "",
      notes: "",
    });
  };

  const handleAddLabel = () => {
    setLabelList([...labelList, labelInput]);
    resetLabelInput();
  };

  const handleRemoveLabel = (index: number) => {
    setLabelList(labelList.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h1 className="text-xl font-bold">QR Generator with Save/Load</h1>
      <div className="flex">
        <div className="flex flex-col">
          <div className="border p-4 w-fit">
            <QRCode value={currentValue}/>
            <p className="mt-2 text-sm text-gray-600">Value: {currentValue}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="space-x-2">
            <input
              type="text"
              value={labelInput.name}
              onChange={(e) => setLabelInput({ ...labelInput, name: e.target.value })}
              placeholder="名前"
            />

            <select
              value={labelInput.antenna || ""}
              onChange={(e) => setLabelInput({ ...labelInput, antenna: e.target.value as AntennaID })}
            >
              <option value="">(選択してください)</option>
              {antennaOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <select
              value={labelInput.head || ""}
              onChange={(e) => setLabelInput({ ...labelInput, head: e.target.value as HeadID })}
            >
              <option value="">(選択してください)</option>
              {headOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <select
              value={labelInput.color || ""}
              onChange={(e) => setLabelInput({ ...labelInput, color: e.target.value as ColorID })}
            >
              <option value="">(選択してください)</option>
              {colorOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <input
              type="number"
              value={labelInput.hp || ""}
              onChange={(e) => setLabelInput({ ...labelInput, hp: Number(e.target.value) })}
              placeholder="HP"
            />

            <input
              type="number"
              value={labelInput.evasion || ""}
              onChange={(e) => setLabelInput({ ...labelInput, evasion: Number(e.target.value) })}
              placeholder="回避"
            />

            <textarea
              value={labelInput.notes}
              onChange={(e) => setLabelInput({ ...labelInput, notes: e.target.value })}
              placeholder="メモ"
            />

            <button onClick={handleAddLabel} className="bg-gray-500 text-white px-3 py-1">ラベル追加</button>
            <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1">保存</button>
            <button onClick={handleNext} className="bg-blue-500 text-white px-3 py-1">次へ</button>
            <div>
              {labelList.map((label, index) => (
                <div key={index} className="border p-2 relative">
                  <button onClick={() => handleRemoveLabel(index)} className="absolute top-0 right-0 text-xs text-red-500">x</button>
                  <div>名前: {label.name}</div>
                  <div>アンテナ: {label.antenna}</div>
                  <div>頭の形: {label.head}</div>
                  <div>色: {label.color}</div>
                  <div>HP: {label.hp}</div>
                  <div>回避率: {label.evasion}</div>
                  <div>備考: {label.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="font-semibold mt-4">保存済みQRコード:</h2>
        <ul className="mt-2 space-y-4">
          {QRList.map((item) => (
            <li key={item.id} className="flex items-start space-x-4 border p-4">
              <div>
                <QRCode value={item.value} size={64}/>
                <div className="mt-2 text-sm text-gray-600">Value: {item.value}</div>
              </div>
              <div className="flex flex-col space-y-1">
                {item.label.map((label, index) => (
                  <div key={index} className={`p-2 rounded bg-${label.color}-500`}>
                    <div>名前: {label.name}</div>
                    <div>アンテナ: {label.antenna}</div>
                    <div>頭の形: {label.head}</div>
                    <div>色: {label.color}</div>
                    <div>HP: {label.hp}</div>
                    <div>回避率: {label.evasion}</div>
                    <div>備考: {label.notes}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 ml-auto"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
