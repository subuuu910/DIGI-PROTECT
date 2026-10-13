import React, { useState, useEffect } from 'react';
import { Mail, Clock, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface SimulatedInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: string) => void;
}

export const SimulatedInboxModal: React.FC<SimulatedInboxModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
}) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const data = await api.getSimulatedInbox();
      setEmails(data);
    } catch (err) {
      console.warn('Could not fetch simulated inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Simulated Medical Email Inbox
              </h2>
              <p className="text-xs text-slate-500">
                Dispatched password reset verification tokens & security codes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInbox}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {emails.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 font-medium">No verification emails dispatched yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Initiate a "Forgot Password" request using any registered email address (e.g. <code>e.vance@medikiosk.health</code>) to generate a verification token.
              </p>
            </div>
          ) : (
            emails.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-cyan-300 bg-slate-50/50 space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                    <span>To: {msg.to}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 font-medium">
                  {msg.subject}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">6-Digit Verification Code:</span>
                    <span className="font-mono font-bold text-cyan-800 text-sm tracking-wider">
                      {msg.verificationCode}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono break-all line-clamp-1">
                    Token: {msg.token}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(msg.verificationCode);
                      setCopiedId(msg.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? 'Code Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectToken(msg.token);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Use Token to Reset</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
