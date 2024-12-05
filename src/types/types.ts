export interface IProduct {
  id: number;
  name: string;
  price: number;
}

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discountCode: string;
  discountAmount: number;
};

export type FormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  cashGiven: string;
};

export interface IOrderDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  cashGiven: string;
  cart: CartItem[];
  total: number;
}
