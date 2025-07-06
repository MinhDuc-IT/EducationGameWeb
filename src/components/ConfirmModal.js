// src/components/ConfirmModal.jsx
import React from "react";

function ConfirmModal({ visible, message, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button
            onClick={onConfirm}
            style={{ ...styles.button, backgroundColor: "#f44336" }}
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            style={{ ...styles.button, backgroundColor: "#4caf50" }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "30px 25px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
  },
  message: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#2e7d32",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  button: {
    flex: 1,
    padding: "10px 0",
    fontSize: "16px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default ConfirmModal;
