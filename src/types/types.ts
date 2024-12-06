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
  cashGiven: number;
};

export interface IOrderDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  cashGiven: number;
  cart: CartItem[];
  total: number;
}
