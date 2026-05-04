import { useState } from "react";
import { registerShopWithAdmin } from "../api/authApi";
import { createShop } from "../api/shopApi";

export const useRegisterShop = (isLoggedIn, currentUser, actions) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (adminForm, shopForm, members, logoData, skipMembers = false) => {
    setError("");
    setSaving(true);
    try {
      const filledMembers = skipMembers ? [] : members.filter((m) => m.name.trim() && m.email.trim() && m.password.trim());

      if (isLoggedIn) {
        const res = await createShop({
          name: shopForm.name,
          address: shopForm.address,
          phone: shopForm.phone,
          email: shopForm.email,
          taxRate: shopForm.taxRate,
          currency: shopForm.currency,
          receiptFooter: shopForm.receiptFooter,
          logo: logoData,
          members: filledMembers,
        });
        const shop = res.data.data?.shop ?? res.data.data;
        const updatedUser = { ...currentUser, shop };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent("user-updated", { detail: updatedUser }));
        setResult({ shop, members: [] });
      } else {
        const res = await registerShopWithAdmin({
          admin: {
            name: adminForm.name,
            email: adminForm.email,
            phone: adminForm.phone,
            password: adminForm.password,
          },
          shop: {
            name: shopForm.name,
            address: shopForm.address,
            phone: shopForm.phone,
            email: shopForm.email,
            taxRate: shopForm.taxRate,
            currency: shopForm.currency,
            receiptFooter: shopForm.receiptFooter,
            logo: logoData,
          },
          members: filledMembers,
        });
        const token = res.data.data?.token;
        const user = res.data.data?.user;
        if (!token || !user) throw new Error("Invalid response from server");
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        actions.login(user.email, null, user);
        setResult(res.data.data);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Registration failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { saving, error, result, setError, handleSubmit };
};
