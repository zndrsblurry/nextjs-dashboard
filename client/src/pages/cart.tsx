import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";
import { useCartStore } from "@/stores/cartStore";

const Cart = () => {
  const cart = useCartStore((state) => state.cart);

  return (
    <>
      {/* Cart Header */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-r from-indigo-500/10 to-rose-500/10">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your Shopping Cart</h1>
          <p className="mt-4 text-gray-500 md:text-xl">Review and manage your items.</p>
        </div>
      </section>

      {/* Cart Container */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2">
              <CartList />
              {cart.length === 0 && (
                <div className="mt-4">
                  <Button asChild className="bg-secondary hover:bg-secondary/90">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div>
                <CartSummary />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
