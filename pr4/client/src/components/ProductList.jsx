import React from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return <div className="empty">🛍️ Товаров пока нет. Добавьте первый!</div>;
  }

  return (
    <div className="list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}