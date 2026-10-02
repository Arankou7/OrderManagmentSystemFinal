// Keep administrative records available to admins, but hide inactive listings from customers.
export const isVisibleProduct = (product) => ['ACTIVE', 'OUT_OF_STOCK'].includes(product?.status);

export const canPurchaseProduct = (product, inventory) =>
  product?.status === 'ACTIVE' &&
  Boolean(product.skuCode) &&
  Number.isFinite(inventory?.availableQuantity) &&
  inventory.availableQuantity > 0;
