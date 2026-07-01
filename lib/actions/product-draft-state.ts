export type ProductDraftActionState = {
  error: string | null;
  mode: "created" | "updated" | null;
  ok: boolean;
  productId: string | null;
  valuesSaved: number;
};

export const initialProductDraftActionState: ProductDraftActionState = {
  error: null,
  mode: null,
  ok: false,
  productId: null,
  valuesSaved: 0,
};
