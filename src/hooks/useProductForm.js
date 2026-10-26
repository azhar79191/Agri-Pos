import { useState, useCallback, useRef } from "react";
import { useProducts } from "../context/ProductsContext";
import { useApp } from "../context/AppContext";
import { EMPTY_PRODUCT_FORM, generateSKU } from "../constants/products";

/**
 * useProductForm — manages add/edit/delete state and handlers for the Products page.
 * Keeps all form logic out of the Products component.
 */
export function useProductForm() {
  const { addProduct, editProduct, removeProduct, fetchProducts } = useProducts();
  const { actions } = useApp();

  const newSku = useRef(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm]  = useState(null);
  const [formData, setFormData]            = useState(EMPTY_PRODUCT_FORM);
  const [submitting, setSubmitting]        = useState(false);

  const resetForm = useCallback(() => {
    newSku.current = null;
    setFormData(EMPTY_PRODUCT_FORM);
    setEditingProduct(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((product, shopBrands) => {
    setEditingProduct(product);
    const mfr = product.manufacturer || "";
    setFormData({
      ...EMPTY_PRODUCT_FORM,
      ...product,
      brand:       shopBrands.includes(mfr) ? mfr : (mfr ? "__other__" : ""),
      customBrand: shopBrands.includes(mfr) ? "" : mfr,
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      if (!editingProduct) newSku.current ||= generateSKU(formData.name, formData.category);
      const payload = {
        ...formData,
        sku:           editingProduct?.sku || newSku.current,
        price:         parseFloat(formData.price),
        costPrice:     parseFloat(formData.costPrice) || 0,
        stock:         parseInt(formData.stock),
        minStockLevel: parseInt(formData.minStockLevel) || 5,
        manufacturer:  formData.brand === "__other__" ? (formData.customBrand || "") : formData.brand,
        description:   formData.subUnit
          ? `${formData.description || ""} | Size: ${formData.subUnit}`.trim()
          : formData.description,
      };
      delete payload.brand;
      delete payload.subUnit;
      delete payload.customBrand;

      if (editingProduct) {
        if (payload.stock === editingProduct.stock) delete payload.stock;
        else payload.expectedStock = editingProduct.stock;
        await editProduct(editingProduct._id, payload);
        actions.showToast({ message: "Product updated successfully", type: "success" });
      } else {
        await addProduct(payload);
        actions.showToast({ message: "Product added successfully", type: "success" });
      }
      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || err.message || "Something went wrong", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingProduct, addProduct, editProduct, fetchProducts, actions, resetForm]);

  const confirmDelete = useCallback(async () => {
    try {
      await removeProduct(deleteConfirm._id);
      actions.showToast({ message: "Product deleted successfully", type: "success" });
      setDeleteConfirm(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    }
  }, [deleteConfirm, removeProduct, actions]);

  return {
    isModalOpen, setIsModalOpen,
    editingProduct,
    deleteConfirm, setDeleteConfirm,
    formData, setFormData,
    submitting,
    openAdd, openEdit,
    handleSubmit, confirmDelete,
    resetForm,
  };
}
