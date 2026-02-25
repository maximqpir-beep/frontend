import React from "react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const isLowStock = product.stock < 5;

  return (
    <div style={{
      border: "1px solid #333",
      borderRadius: "12px",
      padding: "16px",
      background: "#1a1f2e",
      color: "white",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <h3 style={{margin: 0}}>{product.name}</h3>
        <span style={{background: "#2a2f3e", padding: "4px 8px", borderRadius: "20px", fontSize: "12px"}}>
          {product.category}
        </span>
      </div>
      
      <p style={{margin: 0, color: "#aaa"}}>{product.description}</p>
      
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <span style={{color: "#4ade80", fontSize: "20px", fontWeight: "bold"}}>
          {product.price.toLocaleString()} ₽
        </span>
        <span style={{color: isLowStock ? "#f87171" : "white"}}>
          {product.stock} шт.
        </span>
      </div>
      
      <div style={{display: "flex", gap: "8px", marginTop: "8px"}}>
        <button onClick={() => onEdit(product)} style={buttonStyle}>
          ✏️ Редактировать
        </button>
        <button onClick={() => onDelete(product.id)} style={{...buttonStyle, background: "#3b1e1e", borderColor: "#f87171"}}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  flex: 1,
  padding: "8px",
  border: "1px solid #333",
  borderRadius: "8px",
  background: "#2a2f3e",
  color: "white",
  cursor: "pointer"
};
