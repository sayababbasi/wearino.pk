interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  // Auto-detect variant based on status if not provided
  const getVariant = () => {
    if (variant) return variant;
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('active') || lowerStatus.includes('completed') || lowerStatus.includes('success')) {
      return 'success';
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return 'warning';
    }
    if (lowerStatus.includes('failed') || lowerStatus.includes('cancelled') || lowerStatus.includes('suspended')) {
      return 'danger';
    }
    if (lowerStatus.includes('shipped') || lowerStatus.includes('info')) {
      return 'info';
    }
    return 'default';
  };

  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const selectedVariant = getVariant();

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[selectedVariant]}`}>
      {status}
    </span>
  );
}