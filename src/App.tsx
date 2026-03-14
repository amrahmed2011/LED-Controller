/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, CheckCircle2 } from 'lucide-react';

const FIREBASE_URL = 'https://nod-mcu-72dcf-default-rtdb.firebaseio.com/led.json';

export default function App() {
  const [switchStates, setSwitchStates] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [loading, setLoading] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleSwitch = async (id: number) => {
    const newState = !switchStates[id];
    const value = newState ? id : id + 4;
    
    setLoading(id);
    try {
      const response = await fetch(FIREBASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      });

      if (response.ok) {
        setSwitchStates(prev => ({ ...prev, [id]: newState }));
        setStatusMessage(`LED ${id} has successfully turned ${newState ? 'ON' : 'OFF'}`);
        // Clear message after 3 seconds
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        console.error('Failed to update LED state');
      }
    } catch (error) {
      console.error('Error connecting to Firebase:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-sky-400 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 w-full max-w-md relative overflow-hidden"
      >
        <h1 className="text-4xl font-bold text-white mb-8 text-center tracking-tight">
          LED Controller
        </h1>
        
        <div className="space-y-6">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {id}
                </div>
                <span className="text-white font-medium text-xl">Switch {id}</span>
              </div>
              
              <button
                onClick={() => toggleSwitch(id)}
                disabled={loading !== null}
                className={`relative w-20 h-10 rounded-full transition-colors duration-300 focus:outline-none ${
                  switchStates[id] ? 'bg-emerald-500' : 'bg-slate-400'
                } ${loading === id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                id={`switch-${id}`}
              >
                <motion.div
                  animate={{ x: switchStates[id] ? 44 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <Power size={16} className={switchStates[id] ? 'text-emerald-500' : 'text-slate-400'} />
                </motion.div>
                
                <span className="sr-only">Toggle Switch {id}</span>
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-50">
                <CheckCircle2 size={20} className="text-emerald-300 shrink-0" />
                <p className="text-sm font-medium leading-tight">
                  {statusMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm font-mono">
            Connected to Firebase Realtime DB
          </p>
        </div>
      </motion.div>
    </div>
  );
}
