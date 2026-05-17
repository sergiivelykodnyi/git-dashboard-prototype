import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { setToastHandler } from '../utils/toast';

interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'err';
}

let toastId = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setToastHandler((msg, type) => {
      const id = toastId++;
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    });
    return () => { setToastHandler(null); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'ok' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
