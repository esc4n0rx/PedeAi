"use client"

import { useState, useEffect, useRef } from "react"
import { XCircle } from "lucide-react"

interface LogEntry {
  id: string; // Mudado para string para garantir unicidade
  type: 'info' | 'success' | 'error' | 'warn';
  message: string;
  timestamp: Date;
  data?: any;
}

interface DebugPanelProps {
  isVisible?: boolean;
}

export function DynamicDebugPanel({ isVisible = true }: DebugPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [authState, setAuthState] = useState<any>(null);
  
  // Ref para armazenar as funções originais do console
  const originalConsoleRef = useRef<any>(null);
  
  // Evitar duplicate keys gerando IDs únicos
  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };

  // Substituir os métodos de console para capturar logs
  useEffect(() => {
    if (!isVisible) return;

    // Verificar localStorage para depuração
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        setAuthState({
          tokenPresent: true,
          tokenLength: authToken.length,
          tokenStart: authToken.substring(0, 20) + '...',
        });
      } else {
        setAuthState({ tokenPresent: false });
      }
    } catch (error) {
      setAuthState({ error: 'Erro ao acessar localStorage' });
    }

    // Salvar as funções originais apenas uma vez
    if (!originalConsoleRef.current) {
      originalConsoleRef.current = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
      };
    }

    // Função para adicionar log ao estado
    const addLog = (type: 'info' | 'success' | 'error' | 'warn', message: string, data?: any) => {
      setLogs(prev => {
        const newLog = {
          id: generateUniqueId(),
          type,
          message,
          timestamp: new Date(),
          data
        };
        return [newLog, ...prev.slice(0, 49)]; // Manter apenas os últimos 50 logs
      });
    };

    // Substituir console.log
    console.log = (...args: any[]) => {
      originalConsoleRef.current.log(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.includes('[INFO]')) {
        addLog('info', message.replace('[INFO]', ''));
      } else if (message.includes('[SUCCESS]')) {
        addLog('success', message.replace('[SUCCESS]', ''));
      } else if (message.includes('[ERROR]')) {
        addLog('error', message.replace('[ERROR]', ''));
      } else if (message.includes('[WARN]')) {
        addLog('warn', message.replace('[WARN]', ''));
      }
    };

    // Substituir console.error
    console.error = (...args: any[]) => {
      originalConsoleRef.current.error(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('[ERROR]')) {
        addLog('error', message);
      }
    };

    // Substituir console.warn
    console.warn = (...args: any[]) => {
      originalConsoleRef.current.warn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('[WARN]')) {
        addLog('warn', message);
      }
    };

    // Restaurar os métodos originais do console quando o componente for desmontado
    return () => {
      if (originalConsoleRef.current) {
        console.log = originalConsoleRef.current.log;
        console.error = originalConsoleRef.current.error;
        console.warn = originalConsoleRef.current.warn;
        console.info = originalConsoleRef.current.info;
        console.debug = originalConsoleRef.current.debug;
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-black bg-opacity-90 text-white transition-transform duration-300 ${isOpen ? 'transform-none' : 'transform translate-y-full'}`}
      style={{ maxHeight: '40vh', overflowY: 'auto' }}
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="px-2 py-1 bg-blue-600 rounded text-xs"
          >
            {isOpen ? 'Esconder Debug' : 'Mostrar Debug'}
          </button>
          
          <button 
            onClick={() => setLogs([])} 
            className="px-2 py-1 bg-red-600 rounded text-xs"
          >
            Limpar Logs
          </button>
          
          <span className="text-xs font-mono">
            Auth: {authState ? JSON.stringify(authState) : 'Carregando...'}
          </span>
        </div>
        <XCircle 
          onClick={() => setIsOpen(false)} 
          className="cursor-pointer w-5 h-5 text-gray-400 hover:text-white"
        />
      </div>
      
      <div className="p-2 font-mono text-xs">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`mb-1 p-1 rounded ${
              log.type === 'error' ? 'bg-red-900' : 
              log.type === 'warn' ? 'bg-yellow-900' : 
              log.type === 'success' ? 'bg-green-900' : 
              'bg-blue-900'
            }`}
          >
            <div className="flex items-start">
              <span className="w-24 text-gray-400">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex-1">
                <span className="font-bold">
                  {log.type.toUpperCase()}
                </span>
                <span className="ml-2">{log.message}</span>
                {log.data && (
                  <pre className="mt-1 p-1 bg-black bg-opacity-30 rounded overflow-x-auto">
                    {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 italic">Nenhum log registrado ainda...</div>
        )}
      </div>
    </div>
  );
}