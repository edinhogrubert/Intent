import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { Intent } from '../types';

export function IntentManager() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'intents'), where('creator_id', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intent));
      setIntents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !title.trim()) return;
    
    await addDoc(collection(db, 'intents'), {
      creator_id: auth.currentUser.uid,
      title,
      description,
      status: 'draft',
      created_at: new Date().toISOString(),
      visibility: 'private'
    });
    setTitle('');
    setDescription('');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateIntent} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Nova Intent</h3>
        <input className="w-full mb-3 p-2 border rounded" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full mb-3 p-2 border rounded" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="bg-[#0055FF] text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusCircle size={18} /> Criar
        </button>
      </form>

      <div className="grid gap-4">
        {intents.map(intent => (
          <div key={intent.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <div>
              <h4 className="font-bold">{intent.title}</h4>
              <p className="text-sm text-slate-500">{intent.description}</p>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded">{intent.status}</span>
            </div>
            <button onClick={() => deleteDoc(doc(db, 'intents', intent.id))} className="text-rose-500">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
