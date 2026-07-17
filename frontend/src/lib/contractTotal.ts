export interface ItemLike {
  quantity: number | string;
  unitPrice: number | string;
}

// Espelho da regra do backend: total = soma(qtd * preço) - desconto, nunca negativo.
export function computeContractTotal(items: ItemLike[], discount: number | string): number {
  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const net = total - (Number(discount) || 0);
  return Math.max(Math.round(net * 100) / 100, 0);
}
