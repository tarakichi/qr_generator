import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { addQRData, deleteQRData, subscribeQRData } from './firebase';
import type { AntennaID, ColorID, HeadID, LabelEntry, QRData } from './types';
import { antennaOptions, colorOptions, headOptions } from './options';

function generateRandomString(length = 40) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const colorLabelMap: Record<ColorID, string> = colorOptions.reduce((acc, cur) => {
    acc[cur.id] = cur.label;
    return acc;
}, {} as Record<ColorID, string>);

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
    return () => unsubscribe?.();
  }, []);

  const handleNext = () => {
    setCurrentValue(generateRandomString());
    setLabelList([]);
    resetLabelInput();
  }

  const handleSave = async () => {
    const id = await addQRData(currentValue, labelList);
    console.log("保存完了 ID:", id);
    setCurrentValue(generateRandomString());
    setLabelList([]);
    resetLabelInput();
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
    <div className="w-screen flex flex-col items-center p-6 space-y-6">
      <h1 className="text-xl font-bold">QR Generator with Save/Load</h1>
      <div className="w-full flex gap-2">
        <div className="w-1/2 flex flex-col items-center border border-gray-200 p-4">
            <QRCode value={currentValue}/>
            <p className="mt-2 text-xs text-gray-600">Value: {currentValue}</p>
        </div>
        <div className="w-1/2 flex flex-col items-center border border-gray-200 p-4 gap-2">
          <input
            type="text"
            value={labelInput.name}
            onChange={(e) => setLabelInput({ ...labelInput, name: e.target.value })}
            className="w-3/4 border text-center rounded border-gray-200"
            placeholder="名前"
          />

          <select
            value={labelInput.antenna || ""}
            onChange={(e) => setLabelInput({ ...labelInput, antenna: e.target.value as AntennaID })}
            className="w-3/4 border text-center rounded border-gray-200"
          >
            <option value="">(アンテナ)</option>
            {antennaOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          <select
            value={labelInput.head || ""}
            onChange={(e) => setLabelInput({ ...labelInput, head: e.target.value as HeadID })}
            className="w-3/4 border text-center rounded border-gray-200"
          >
            <option value="">(頭の形)</option>
            {headOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          <select
            value={labelInput.color || ""}
            onChange={(e) => setLabelInput({ ...labelInput, color: e.target.value as ColorID })}
            className="w-3/4 border text-center rounded border-gray-200"
          >
            <option value="">(色)</option>
            {colorOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          
          <div className="w-3/4 flex justify-center items-center space-x-2">
            <label htmlFor="hp">&#xff28;&#xff30;:</label>
            <input
              id="hp"
              type="range"
              min={0}
              max={100}
              value={labelInput.hp ?? 0}
              onChange={(e) => setLabelInput({ ...labelInput, hp: Number(e.target.value) })}
              className="w-2/3"
            />
            <span>{labelInput.hp ?? 0}</span>
          </div>
          
          <div className="w-3/4 flex justify-center items-center space-x-2">
            <label htmlFor="evasion">回避:</label>
            <input
              id="evasion"
              type="range"
              min={0}
              max={50}
              value={labelInput.evasion ?? 0}
              onChange={(e) => setLabelInput({ ...labelInput, evasion: Number(e.target.value) })}
              className="w-2/3"
            />
            <span>{labelInput.evasion ?? 0}</span>
          </div>

          <textarea
            value={labelInput.notes}
            onChange={(e) => setLabelInput({ ...labelInput, notes: e.target.value })}
            className="w-3/4 border text-center rounded border-gray-200"
            placeholder="メモ"
          />
          <div className="flex justify-center gap-2">
            <button onClick={handleAddLabel} className="bg-gray-500 text-white px-3 py-1 rounded">ラベル追加</button>
            <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded">保存</button>
            <button onClick={handleNext} className="bg-blue-500 text-white px-3 py-1 rounded">次へ</button>
          </div>
          <div className="w-3/4">
            {labelList.map((lbl, index) => (
              <div key={index} className="border relative border-gray-200 p-4">
                <button onClick={() => handleRemoveLabel(index)} className="absolute top-0 right-2 text-xs text-red-500">
                  x
                </button>
                <div>名前: {lbl.name}</div>
                <div>アンテナ: {lbl.antenna && antennaOptions[Number(lbl.antenna)].label}</div>
                <div>頭の形: {lbl.head && headOptions[Number(lbl.head)].label}</div>
                <div>色: {lbl.color && colorLabelMap[lbl.color]}</div>
                <div>HP: {lbl.hp}</div>
                <div>回避率: {lbl.evasion}</div>
                <div>備考: {lbl.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <img src="/GTKvlqxbQAIZ4jY.jfif" alt="体格表" />

      <div className="w-full max-w-4xl">
        <h2 className="font-semibold mt-4">保存済みQRコード:</h2>
        <ul className="mt-2 space-y-4">
          {QRList.map((item) => (
            <li key={item.id} className="flex items-start space-x-4 border p-4 border-gray-200">
              <div>
                <QRCode value={item.value} size={64}/>
                <div className="mt-2 text-sm text-gray-600">Value: {item.value}</div>
              </div>
              <div className="flex flex-col space-y-1">
                {item.label.map((lbl, index) => (
                  <div key={index} className={`p-2 rounded bcgd-${lbl.color}`}>
                    <div>名前: {lbl.name}</div>
                    <div>アンテナ: {lbl.antenna && antennaOptions[Number(lbl.antenna)].label}</div>
                    <div>頭の形: {lbl.head && headOptions[Number(lbl.head)].label}</div>
                    <div>色: {lbl.color && colorLabelMap[lbl.color]}</div>
                    <div>HP: {lbl.hp}</div>
                    <div>回避率: {lbl.evasion}</div>
                    <div>備考: {lbl.notes}</div>
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
