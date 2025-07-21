import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { addQRData, deleteQRData, subscribeQRData } from './lib/firebase/qrData';
import type { AntennaID, ColorID, HeadID, LabelEntry, QRData } from './types';
import { antennaOptions, colorOptions, headOptions } from './constants/options';
import { BodyChart } from './components/BodyChart';
import { useAuth } from './hooks/useAuth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { adminUIDs } from './constants/adminUIDs';
import { GoogleIcon } from './components/GoogleIcon';

function generateRandomString(length = 40) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const colorLabelMap: Record<ColorID, string> = colorOptions.reduce((acc, cur) => {
    acc[cur.id] = cur.label;
    return acc;
}, {} as Record<ColorID, string>);

function App() {
  const { user, loading } = useAuth();
  const isAdmin = user && adminUIDs.includes(user.uid);
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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("ログイン成功");
    } catch (error) {
      console.log("ログインエラー", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウトしました");
    } catch (error) {
      console.log("ログアウトエラー", error);
    }
  }

  const handleNext = () => {
    setCurrentValue(generateRandomString());
    setLabelList([]);
    resetLabelInput();
  }

  const handleSave = async () => {
    const id = await addQRData(currentValue, labelList);
    console.log("保存完了 ID:", id);
    alert(`保存完了 ID: ${id}`);
  }

  const handleDelete = async (id: string) => {
    await deleteQRData(id);
    console.log("削除完了 ID:", id);
    alert(`削除完了 ID: ${id}`);
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

  if (loading) return <div>読み込み中...</div>

  return (
    <div className="w-screen flex flex-col items-center p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-200 font-notosans">QRコードジェネレータ</h1>
      <div className="w-1/2 bg-white p-4 rounded border border-zinc-200">
        {user ? (
          <div className="flex justify-center items-center gap-4">
            <p className="text-zinc-700">こんにちは、{user.displayName || user.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-3 border border-zinc-200 px-4 py-2 rounded shadow hover:shadow-lg transition bg-white text-zinc-300"
            >
              <span className="text-sm font-bold font-notosans">ログアウト</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center space-x-3 border border-zinc-200 px-4 py-2 rounded shadow hover:shadow-lg transition bg-white text-zinc-300"
            >
              <GoogleIcon />
              <span className="text-sm font-bold font-notosans">Sign in with Google</span>
            </button>
          </div>
        )}
      </div>
      <div className="w-full flex gap-2">
        <div className="w-1/2 flex flex-col items-center border border-zinc-200 p-4 bg-white rounded">
            <QRCode value={currentValue}/>
            <p className="mt-2 text-xs text-gray-600">Value: {currentValue}</p>
        </div>
        <div className="w-1/2 flex flex-col items-center border border-zinc-200 p-4 gap-2 bg-white rounded">
          <input
            type="text"
            value={labelInput.name}
            onChange={(e) => setLabelInput({ ...labelInput, name: e.target.value })}
            className="w-3/4 bg-white border text-center rounded border-zinc-200"
            placeholder="名前"
          />

          <select
            value={labelInput.antenna || ""}
            onChange={(e) => setLabelInput({ ...labelInput, antenna: e.target.value as AntennaID })}
            className="w-3/4 bg-white border text-center rounded border-zinc-200"
          >
            <option value="">(アンテナ)</option>
            {antennaOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          <select
            value={labelInput.head || ""}
            onChange={(e) => setLabelInput({ ...labelInput, head: e.target.value as HeadID })}
            className="w-3/4 bg-white border text-center rounded border-zinc-200"
          >
            <option value="">(頭の形)</option>
            {headOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          <select
            value={labelInput.color || ""}
            onChange={(e) => setLabelInput({ ...labelInput, color: e.target.value as ColorID })}
            className="w-3/4 bg-white border text-center rounded border-zinc-200"
          >
            <option value="">(色)</option>
            {colorOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          
          <div className="w-3/4 bg-white flex justify-center items-center space-x-2 rounded">
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
          
          <div className="w-3/4 bg-white flex justify-center items-center space-x-2 rounded">
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
            className="w-3/4 bg-white border text-center rounded border-zinc-200"
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

      <BodyChart/>

      <div className="w-full max-w-4xl">
        <h2 className="font-semibold mt-4">保存済みQRコード:</h2>
        <ul className="w-full mt-2 space-y-4">
          {QRList.map((item) => (
            <li key={item.id} className="flex w-full items-start border p-4 border-gray-200">
              <div className="w-2/3">
                <QRCode value={item.value} size={64}/>
                <div className="mt-2 text-sm text-cyan-700">Value: {item.value}</div>
              </div>
              <div className="flex w-1/3 space-y-1">
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
              {( user && (isAdmin || user?.uid === item.uid)) && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 ml-auto"
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
