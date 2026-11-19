"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./SupportSection.module.css";

type Message = { id: string; sender: "support" | "user"; text: string; createdAt: string };
type Conversation = { id: string; status: string; updatedAt: string; user: { fullName: string | null; email: string }; messages: Message[] };

export default function SupportSection({ flash }: { flash: (kind: "ok" | "error", text: string) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/support?all=1", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setConversations(data.conversations || []);
    setSelectedId((current) => current || data.conversations?.[0]?.id || null);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) || null;
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selected.id, message: reply.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reply failed");
      setReply("");
      await load();
    } catch (error) {
      flash("error", error instanceof Error ? error.message : "Reply failed");
    } finally {
      setSending(false);
    }
  };

  return <div className={styles.layout}>
    <aside className={styles.list}>
      <div className={styles.heading}><h2>Live support</h2><p>Persistent customer conversations</p></div>
      {conversations.map((conversation) => <button key={conversation.id} type="button" className={`${styles.conversation} ${selectedId === conversation.id ? styles.active : ""}`} onClick={() => setSelectedId(conversation.id)}>
        <strong>{conversation.user.fullName || conversation.user.email}</strong>
        <span>{conversation.messages.at(-1)?.text || "No messages"}</span>
      </button>)}
      {!conversations.length && <div className={styles.empty}>No support conversations yet.</div>}
    </aside>
    <section className={styles.chat}>
      {selected ? <>
        <header className={styles.chatHead}><strong>{selected.user.fullName || "Customer"}</strong><span>{selected.user.email}</span></header>
        <div className={styles.messages}>{selected.messages.map((message) => <div key={message.id} className={`${styles.message} ${message.sender === "support" ? styles.admin : ""}`}>
          {message.text}<small>{new Date(message.createdAt).toLocaleString()}</small>
        </div>)}</div>
        <form className={styles.composer} onSubmit={send}><textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} placeholder="Write a reply…" aria-label="Support reply"/><button type="submit" disabled={sending || !reply.trim()}>{sending ? "Sending…" : "Send"}</button></form>
      </> : <div className={styles.empty}>Select a conversation to reply.</div>}
    </section>
  </div>;
}
