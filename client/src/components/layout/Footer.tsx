import { Link } from "wouter";
import { ShopIcon } from "@/components/ui/shop-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ShopIcon className="h-6 w-6 text-secondary" />
              <span className="font-bold text-xl">ShopMini</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              A Next.js 14 e-commerce demo project with TypeScript, TailwindCSS, shadcn/ui, and Zustand.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/category/cars" className="text-sm text-gray-500 hover:text-secondary">
                    Cars
                  </Link>
                </li>
                <li>
                  <Link href="/category/motorcycles" className="text-sm text-gray-500 hover:text-secondary">
                    Motorcycles
                  </Link>
                </li>
                <li>
                  <Link href="/category/phones" className="text-sm text-gray-500 hover:text-secondary">
                    Phones
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-500 hover:text-secondary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-sm text-gray-500 hover:text-secondary">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Subscribe</h3>
            <p className="text-sm text-gray-500">
              Stay up to date with our latest products and offers.
            </p>
            <form className="flex w-full items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex h-9 w-full"
              />
              <Button type="submit" className="h-9 bg-secondary hover:bg-secondary/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ShopMini. All rights reserved. This is a demo project.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
