import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updatePassword } from "../api/authApi";
import { getMyShop } from "../api/shopApi";

/**
 * useProfileSettings — manages profile form, password change, avatar, and shop info for ProfileSettings page.
 */
export function useProfileSettings() {
  const { state, actions } = useApp();
  const { user }           = useAuth();
  const { currentUser }    = state;
  const fileInputRef       = useRef(null);

  const displayUser = user || currentUser;

  const [profileForm, setProfileForm]   = useState({ name: "", phone: "", address: "", avatar: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [shop, setShop]                 = useState(null);
  const [saving, setSaving]             = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (displayUser) {
      setProfileForm({ name: displayUser.name || "", phone: displayUser.phone || "", address: displayUser.address || "", avatar: displayUser.avatar || "" });
      setAvatarPreview(displayUser.avatar || "");
    }
    getMyShop().then((res) => setShop(res.data.data?.shop)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { actions.showToast({ message: "Image must be less than 2MB", type: "error" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }, [actions]);

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      const res     = await updateProfile(profileForm);
      const updated = res.data.data?.user ?? res.data.data;
      const merged  = { ...displayUser, ...updated, shop: updated.shop ?? displayUser?.shop };
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("user-updated", { detail: merged }));
      actions.showToast({ message: "Profile updated successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally { setSaving(false); }
  }, [profileForm, displayUser, actions]);

  const handleChangePassword = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      actions.showToast({ message: "New passwords do not match", type: "error" }); return;
    }
    if (passwordForm.newPassword.length < 6) {
      actions.showToast({ message: "Password must be at least 6 characters", type: "error" }); return;
    }
    setSavingPassword(true);
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      actions.showToast({ message: "Password changed successfully", type: "success" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Password change failed", type: "error" });
    } finally { setSavingPassword(false); }
  }, [passwordForm, actions]);

  return {
    displayUser, fileInputRef,
    profileForm, setProfileForm,
    passwordForm, setPasswordForm,
    showPasswords, setShowPasswords,
    avatarPreview, shop,
    saving, savingPassword,
    handleAvatarChange, handleSaveProfile, handleChangePassword,
  };
}
