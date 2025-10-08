import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  brand?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isAvailable = product.status === 'in_stock';

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link
        to={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-slate-100"
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm">
              {product.status === "out_of_stock"
                ? "Out of Stock"
                : "Discontinued"}
            </span>
          </div>
        )}
        {isAvailable && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            In Stock
          </div>
        )}
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-slate-500 font-medium uppercase mb-1">
            {product.brand.name}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-slate-900">
            KSh {product.price.toLocaleString()}
          </p>
          {isAvailable && onAddToCart && (
            <button
              onClick={() => onAddToCart(product.id)}
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
