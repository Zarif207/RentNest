export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CategorySummary = Pick<Category, "id" | "name">;

export type CategoryInput = {
  name: string;
};
