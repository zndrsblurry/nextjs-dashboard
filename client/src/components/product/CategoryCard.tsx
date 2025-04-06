import { Link } from "wouter";

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  imageSrc: string;
}

const CategoryCard = ({ name, slug, description, imageSrc }: CategoryCardProps) => {
  return (
    <Link href={`/category/${slug}`} className="group relative overflow-hidden rounded-lg shadow-lg">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/0"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-100">{description}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
