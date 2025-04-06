import { Link } from "wouter";
import { ShoppingCart, Menu, User, LogIn, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShopIcon } from "@/components/ui/shop-icons";
import { useCartStore } from "@/stores/cartStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const isLoggedIn = false;
  const isAdmin = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <ShopIcon className="h-6 w-6 text-secondary" />
              <span className="font-bold text-xl">ShopMini</span>
            </Link>
          </div>

          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-secondary"
            >
              Home
            </Link>
            <Link
              href="/category/cars"
              className="text-sm font-medium transition-colors hover:text-secondary"
            >
              Cars
            </Link>
            <Link
              href="/category/motorcycles"
              className="text-sm font-medium transition-colors hover:text-secondary"
            >
              Motorcycles
            </Link>
            <Link
              href="/category/phones"
              className="text-sm font-medium transition-colors hover:text-secondary"
            >
              Phones
            </Link>
            <Link
              href="/reservations"
              className="text-sm font-medium transition-colors hover:text-secondary"
            >
              My Reservations
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-gray-100 py-2 px-3"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] text-white">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Orders</DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/reservations">My Reservations</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <UserCog className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  <Link
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    Home
                  </Link>
                  <Link
                    href="/category/cars"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    Cars
                  </Link>
                  <Link
                    href="/category/motorcycles"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    Motorcycles
                  </Link>
                  <Link
                    href="/category/phones"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    Phones
                  </Link>
                  <Link
                    href="/cart"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    Cart
                  </Link>
                  <Link
                    href="/reservations"
                    className="text-sm font-medium transition-colors hover:text-secondary"
                  >
                    My Reservations
                  </Link>
                  <div className="h-px bg-border my-2"></div>
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/reservations"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        My Reservations
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="text-sm font-medium transition-colors hover:text-secondary"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Button variant="outline" size="sm">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/admin"
                        className="text-sm font-medium transition-colors hover:text-secondary"
                      >
                        Admin
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
