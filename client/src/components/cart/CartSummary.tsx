import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

const CartSummary = () => {
  const { getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-medium">Order Summary</h2>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span className="font-medium">Calculated at checkout</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax</span>
          <span className="font-medium">Calculated at checkout</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-bold">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
      <div className="mt-6">
        <Button className="w-full" asChild>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
      <div className="mt-6">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
