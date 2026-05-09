interface Product {
  id: number;
  name: string;
  sales: number;
  revenue: string;
  image: string;
}

interface TopProductsProps {
  products: Product[];
  title?: string;
}

export default function TopProducts({ products, title = 'Top Products' }: TopProductsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-dark-200">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-100 font-bold text-sm flex-shrink-0">
                #{index + 1}
              </div>
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Product';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-xs text-dark-600">{product.sales} sales</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold">{product.revenue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}