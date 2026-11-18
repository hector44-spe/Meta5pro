"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Loader2, Users, Search } from "lucide-react";
import styles from "../page.module.css";

interface ReferralAdminUser {
  id: string;
  email: string;
  username: string;
  referralCode: string;
  referralBalance: number;
  rewardsClaimed: number;
  friendsInvited: number;
  createdAt: string;
}

export default function ReferralsSection() {
  const [users, setUsers] = useState<ReferralAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit balance modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReferralAdminUser | null>(null);
  const [balanceInput, setBalanceInput] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/referrals");
      const data = await res.json();
      if (data.referralUsers) setUsers(data.referralUsers);
    } catch (e) {
      console.error("Failed to load admin referrals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (user: ReferralAdminUser) => {
    setSelectedUser(user);
    setBalanceInput(user.referralBalance || 0);
    setIsModalOpen(true);
  };

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          referralBalance: balanceInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update balance");
      await loadData();
      setIsModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Error saving referral balance");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      u.referralCode?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#fff" }}>
            Referral Program Management
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
            Monitor investor referral codes, balances, and reward claims
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: "300px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <Search size={16} color="rgba(255, 255, 255, 0.4)" />
            <input
              type="text"
              placeholder="Search user or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "13px",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#8c95a0" }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px auto" }} />
          <p>Loading referral program data...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Referral Code</th>
                  <th>Referral Balance</th>
                  <th>Rewards Claimed</th>
                  <th>Friends Invited</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#8c95a0" }}>
                      No referral records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{u.username}</div>
                        <div style={{ fontSize: "12px", color: "#8c95a0" }}>{u.email}</div>
                      </td>
                      <td>
                        <code
                          style={{
                            fontSize: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            color: "#818cf8",
                          }}
                        >
                          {u.referralCode}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600, color: "#10b981" }}>
                        ${u.referralBalance.toFixed(2)}
                      </td>
                      <td style={{ color: "#d1d5db" }}>
                        ${u.rewardsClaimed.toFixed(2)}
                      </td>
                      <td style={{ color: "#fff", fontWeight: 600 }}>
                        {u.friendsInvited}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Balance"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit Balance</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {isModalOpen && selectedUser && (
        <div className={`${styles.modalOverlay} project-edit-modal-overlay`} onClick={() => setIsModalOpen(false)}>
          <div className={`${styles.modal} project-edit-modal-dialog`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Edit Referral Balance for {selectedUser.username}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveBalance}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Referral Code</label>
                  <input
                    type="text"
                    readOnly
                    className={styles.input}
                    value={selectedUser.referralCode}
                    style={{ opacity: 0.7 }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Referral Balance ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className={styles.input}
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(parseFloat(e.target.value) || 0)}
                  />
                  <small style={{ color: "#8c95a0", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    The investor can claim this balance at any time from their Referral program drawer.
                  </small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.btnPrimary}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Balance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
