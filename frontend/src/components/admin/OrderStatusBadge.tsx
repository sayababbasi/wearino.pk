import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  XCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Clock;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: CheckCircle,
  },
  processing: {
    label: 'Processing',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: RefreshCw,
  },
};

export default function OrderStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md' 
}: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}