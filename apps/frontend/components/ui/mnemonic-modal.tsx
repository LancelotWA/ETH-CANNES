"use client";

import { useEffect, useRef, useState, ClipboardEvent, KeyboardEvent } from "react";
import { X, Eye, EyeOff, Lock, AlertTriangle, ArrowLeft, Copy } from "lucide-react";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

interface MnemonicModalProps {
  onConfirm: (mnemonic: string) => void;
  onCancel: () => void;
}

export function MnemonicModal({ onConfirm, onCancel }: MnemonicModalProps) {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"enter" | "create">("enter");
  const [generatedMnemonic, setGeneratedMnemonic] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const updateWord = (index: number, value: string) => {
    setError("");
    const next = [...words];
    next[index] = value;
    setWords(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === " ") {
      e.preventDefault();
      if (index < 11) inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "Backspace" && words[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const parts = pasted.split(/\s+/);

    if (parts.length > 1) {
      // Multi-word paste: fill from current index onward
      const next = [...words];
      parts.forEach((word, i) => {
        if (index + i < 12) next[index + i] = word;
      });
      setWords(next);
      const lastFilled = Math.min(index + parts.length, 11);
      setTimeout(() => inputRefs.current[lastFilled]?.focus(), 0);
    } else {
      // Single word paste
      updateWord(index, pasted);
    }
  };

  const handleConfirm = () => {
    const filled = words.filter((w) => w.trim().length > 0);
    if (filled.length < 12) {
      setError("Please enter all 12 words.");
      return;
    }
    onConfirm(words.map((w) => w.trim()).join(" "));
  };

  const handleCreateAccount = () => {
    const mnemonic = generateMnemonic(wordlist, 128);
    setGeneratedMnemonic(mnemonic);
    setView("create");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMnemonic);
  };

  if (view === "create") {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      >
        <div
          className="w-full max-w-sm rounded-[24px] p-6 flex flex-col gap-6"
          style={{
            background: "#111113",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 0 60px rgba(124,58,237,0.2), 0 24px 48px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex justify-between items-center">
            <button onClick={() => setView("enter")} className="text-[#888892] hover:text-white transition-colors p-1 rounded-full"><ArrowLeft size={18} /></button>
            <h2 className="text-base font-bold font-sans text-white">Create account</h2>
            <div className="w-5"></div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400">
            <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono leading-relaxed">
              Warning, the 12-word sentence below must be kept carefully and not disclosed under any circumstances.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative font-mono text-white text-[14px] leading-8 text-center break-words shadow-inner">
            {generatedMnemonic}
          </div>

          <div className="flex justify-center -mt-2">
            <button onClick={copyToClipboard} className="text-[11px] font-mono flex items-center gap-1.5 text-[#888892] hover:text-white transition-colors py-1.5 px-4 rounded-full hover:bg-white/10">
              <Copy size={13} /> Copy sentence
            </button>
          </div>

          <button
            onClick={() => setView("enter")}
            className="w-full h-11 rounded-[12px] text-sm font-sans font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,#7C3AED,#6366F1)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-[24px] p-6 flex flex-col gap-5"
        style={{
          background: "#111113",
          border: "1px solid rgba(124,58,237,0.25)",
          boxShadow: "0 0 60px rgba(124,58,237,0.2), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.15)" }}
            >
              <Lock size={18} style={{ color: "#A78BFA" }} />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans" style={{ color: "#fff" }}>
                Secret Recovery Phrase
              </h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: "#888892" }}>
                Enter your 12-word Unlink phrase
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full transition-opacity hover:opacity-60"
            style={{ color: "#888892" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 12-word grid */}
        <div className="grid grid-cols-3 gap-2">
          {words.map((word, i) => (
            <div key={i} className="relative">
              {/* Word number */}
              <span
                className="absolute top-1.5 left-2 text-[9px] font-mono select-none pointer-events-none"
                style={{ color: "#44444A" }}
              >
                {i + 1}
              </span>
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type={revealed ? "text" : "password"}
                value={word}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                onChange={(e) => updateWord(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handlePaste(e, i)}
                className="w-full pt-5 pb-1.5 px-2 rounded-[10px] text-xs font-mono outline-none transition-all"
                style={{
                  background: word ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${word ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}`,
                  color: "#fff",
                  caretColor: "#A78BFA",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(124,58,237,0.6)";
                  e.currentTarget.style.background = "rgba(124,58,237,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = `1px solid ${word ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}`;
                  e.currentTarget.style.background = word ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.04)";
                }}
              />
            </div>
          ))}
        </div>

        {/* Show/hide toggle */}
        <button
          onClick={() => setRevealed((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-mono self-start transition-opacity hover:opacity-70"
          style={{ color: "#888892" }}
        >
          {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          {revealed ? "Hide" : "Show"} phrase
        </button>

        {/* Error */}
        {error && (
          <p className="text-xs font-mono" style={{ color: "#F87171" }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-[12px] text-sm font-sans font-medium transition-opacity hover:opacity-70"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#888892",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-[12px] text-sm font-sans font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,#7C3AED,#6366F1)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
            }}
          >
            Confirm →
          </button>
        </div>

        {/* Text option for new account */}
        <div className="flex justify-center mt-1">
          <button
            onClick={handleCreateAccount}
            className="text-[11px] font-mono hover:text-white transition-colors"
            style={{ color: "#A78BFA" }}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
