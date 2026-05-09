import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  TooltipProps
} from 'recharts';

const formatCurrencyCompact = (value: number) => {
  if (value >= 1000000) {
    return `Rs ${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `Rs ${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `Rs ${value}`;
};

// --- Custom Glassmorphic Tooltip ---
const GlassTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-4 min-w-[150px]">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 capitalize">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {typeof entry.value === 'number' && (entry.name?.toLowerCase().includes('revenue') || entry.name?.toLowerCase().includes('sales'))
                  ? formatCurrencyCompact(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface SalesChartProps {
  data: Array<{ month: string; sales: number; orders?: number }>;
  title?: string;
  height?: number;
}

export function SalesLineChart({ data, title = 'Sales Overview', height = 300 }: SalesChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            dy={10}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#9ca3af" // Muted axis color
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => formatCurrencyCompact(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
            name="Sales"
            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff' }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Orders"
            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenericLineChart({ data, title = 'Overview', height = 300, dataKey = 'value', name = 'Value' }: { data: any[], title?: string, height?: number, dataKey?: string, name?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGeneric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} dy={10} />
          <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorGeneric)"
            name={name}
            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  height?: number;
}

export function CategoryPieChart({
  data,
  title = 'Sales by Category',
  height = 300,
}: CategoryChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Donut chart
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<GlassTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({
  data,
  title = 'Category Performance',
  height = 300,
}: CategoryChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orders?: number }>;
  title?: string;
  height?: number;
}

export function RevenueAreaChart({
  data,
  title = 'Revenue Trends',
  height = 400,
}: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenueMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /> {/* Purple start */}
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrdersMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /> {/* Amber start */}
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} minTickGap={30} tick={{ fontSize: 12 }} />

          <YAxis yAxisId="left" stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrencyCompact(val)} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />

          <Tooltip content={<GlassTooltip />} />
          <Legend />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6" // Purple
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenueMain)"
            name="Revenue"
            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff' }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#f59e0b" // Amber
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOrdersMain)"
            name="Orders"
            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}