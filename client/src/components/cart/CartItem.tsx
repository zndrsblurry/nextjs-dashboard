import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/types/product";

interface CartItemProps {
  item: Product & { quantity: number };
}

const CartItem = ({ item }: CartItemProps) => {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCartStore();
  const { id, name, price, image, quantity } = item;

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="h-20 w-20 overflow-hidden rounded-md">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-500">{formatCurrency(price)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-md border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => decrementQuantity(id)}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="flex h-8 w-8 items-center justify-center text-sm">{quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => incrementQuantity(id)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => removeFromCart(id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
