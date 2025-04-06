import { useParams } from "wouter";
import { getProductsByCategory, categoryDescriptions } from "@/lib/products";
import ProductList from "@/components/product/ProductList";

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const products = getProductsByCategory(category);
  const description = categoryDescriptions[category as keyof typeof categoryDescriptions] || "";
  
  // Capitalize the first letter of the category
  const formattedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  return (
    <>
      {/* Category Header */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-r from-indigo-500/10 to-rose-500/10">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{formattedCategory}</h1>
          <p className="mt-4 max-w-[700px] text-gray-500 md:text-xl">{description}</p>
        </div>
      </section>

      {/* Product List */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {products.length > 0 ? (
            <ProductList products={products} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium">No products found</h2>
              <p className="mt-2 text-gray-500">There are no products in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Category;
