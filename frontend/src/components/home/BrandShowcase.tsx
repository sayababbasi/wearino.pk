interface Brand {
  name: string;
  logo: string;
}

interface BrandShowcaseProps {
  brands: Brand[];
  title?: string;
}

export default function BrandShowcase({ 
  brands, 
  title = "Most-Loved Brands" 
}: BrandShowcaseProps) {
  return (
    <section className="w-full py-16 bg-white">
      <h2 className="text-xl md:text-2xl tracking-[4px] text-center mb-12 uppercase text-gray-700">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-8 md:px-24">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            {/* Brand Image */}
            <div className="w-full h-[550px] overflow-hidden">
              <img
                src={api.getImageUrl(brand.logo)}
                alt={brand.name}
                className="w-full h-full object-cover transform transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
            </div>

            {/* Brand Name */}
            <p className="mt-4 text-lg tracking-[2px] text-gray-800 uppercase font-light group-hover:text-black transition-colors duration-300">
              {brand.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}