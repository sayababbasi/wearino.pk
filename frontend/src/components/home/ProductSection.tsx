import Link from 'next/link';
import ProductCard from '@/src/components/product/ProductCard';
import CTAButton from './CTAButton';
import type { Product } from '@/src/types';

interface ProductSectionProps {
  title: string;
  products: Product[];
  ctaText: string;
  ctaLink: string;
  columns?: string;
  bgColor?: string;
}

export default function ProductSection({
  title,
  products,
  ctaText,
  ctaLink,
  columns = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  bgColor = 'bg-dark-50'
}: ProductSectionProps) {
  return (
    <section className={`w-full py-16 ${bgColor}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extralight mb-2 uppercase">{title}</h2>
      </div>
      <div className={`grid ${columns} gap-6 px-4 md:px-8`}>
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
      <div className="text-center mt-8">
        <CTAButton href={ctaLink} text={ctaText} />
      </div>
    </section>
  );
}