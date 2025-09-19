export interface Category {
  _id: string;
  name: string;
  description?: string;
  ageRange?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BookImage {
  _id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  publisher: string;
  category: Category[];
  price: number;
  releaseYear: number;
  stock: number;
  description?: string;
  images?: BookImage[];
  variants?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BookVariant {
  _id: string;
  rarity: string;
  image: string;
  price: number;
  stock: number;
  isbn: string;
}
