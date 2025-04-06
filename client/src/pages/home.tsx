import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/product/CategoryCard";

const Home = () => {
  const categories = [
    {
      name: "Cars",
      slug: "cars",
      description: "Luxury and performance vehicles",
      imageSrc: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop"
    },
    {
      name: "Motorcycles",
      slug: "motorcycles",
      description: "High-performance bikes",
      imageSrc: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop"
    },
    {
      name: "Phones",
      slug: "phones",
      description: "Latest smartphones and accessories",
      imageSrc: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-r from-indigo-500/10 to-rose-500/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Welcome to ShopMini</h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">Discover our curated selection of premium products.</p>
            </div>
            <div className="space-x-4">
              <Button variant="secondary" asChild className="mr-2">
                <a href="#categories">Shop Now</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reservations">My Reservations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Browse Categories</h2>
              <p className="mx-auto max-w-[700px] text-gray-500">Find what you're looking for in our curated categories.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug}
                name={category.name}
                slug={category.slug}
                description={category.description}
                imageSrc={category.imageSrc}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
