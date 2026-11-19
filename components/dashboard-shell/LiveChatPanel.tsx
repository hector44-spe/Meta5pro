"use client";

import type { FormEvent, RefObject } from "react";
import { MessageSquare, Send, X } from "lucide-react";

export interface LiveChatMessage {
  id?: string;
  sender: "support" | "user";
  text: string;
  time: string;
}

interface LiveChatPanelProps {
  messages: LiveChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function LiveChatPanel({ messages, input, onInputChange, onClose, onSubmit, messagesEndRef }: LiveChatPanelProps) {
  return (
    <div className="live-chat-panel" role="dialog" aria-modal="true" aria-label="Live support">
      <div className="live-chat-header" style={{ padding: "14px 16px", backgroundColor: "#1e2126", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0084ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><MessageSquare size={16} /></div>
          <div><div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Live support</div><div style={{ fontSize: "11px", color: "#01b28b" }}>Online 24/7</div></div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.6)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close live support"><X size={20} /></button>
      </div>

      <div className="live-chat-messages" style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((message, index) => (
          <div key={message.id || index} style={{ alignSelf: message.sender === "user" ? "flex-end" : "flex-start", maxWidth: "85%", backgroundColor: message.sender === "user" ? "#4763f0" : "rgba(255, 255, 255, 0.08)", color: "#fff", padding: "11px 14px", borderRadius: "12px", fontSize: "13.5px", lineHeight: "1.45", wordBreak: "break-word" }}>
            <div>{message.text}</div>
            <div style={{ fontSize: "10.5px", opacity: 0.6, marginTop: "5px", textAlign: "right" }}>{message.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <form onSubmit={onSubmit} className="live-chat-form" style={{ padding: "12px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#12141a" }}>
        <input type="text" placeholder="Type your message..." value={input} onChange={(event) => onInputChange(event.target.value)} style={{ flex: 1, background: "rgba(255, 255, 255, 0.07)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px", padding: "10px 16px", color: "#fff", fontSize: "14px", outline: "none", minWidth: 0 }} />
        <button type="submit" style={{ background: "#4763f0", border: "none", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flexShrink: 0 }} aria-label="Send message"><Send size={16} /></button>
      </form>
    </div>
  );
}
