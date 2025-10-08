import React from "react";
import { useParams } from "react-router-dom";
import { ProductForm } from "./ProductForm";

export default function AdminProductEdit() {
  const { id } = useParams();
  return <ProductForm productId={id} />;
}
