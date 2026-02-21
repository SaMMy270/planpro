
export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  dimensions: string;
  material: string;
  rating: number;
}

export interface ComparisonResult {
  competitor: string;
  productName: string;
  price: string;
  url: string;
  keyDifference: string;
}

export interface BlueprintItem {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
}
