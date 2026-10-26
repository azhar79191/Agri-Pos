export function browserScope() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const shop = user?.shop?._id || user?.shop;
    return user && shop ? `${shop}:${user._id || user.id}` : 'signed-out';
  } catch { return 'signed-out'; }
}
export const scopedStorageKey = name => `${name}:${browserScope()}`;
