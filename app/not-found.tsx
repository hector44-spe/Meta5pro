import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#05080b",
        color: "#ffffff",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "64px", fontWeight: 700, margin: 0, color: "#4763f0" }}>
        404
      </h1>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginTop: "12px", marginBottom: "8px" }}>
        Page Not Found
      </h2>
      <p style={{ color: "rgba(255, 255, 255, 0.6)", maxWidth: "420px", marginBottom: "24px" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        style={{
          backgroundColor: "#4763f0",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
