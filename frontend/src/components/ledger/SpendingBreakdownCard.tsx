import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SpendingRecord {
  id: string;
  amount: bigint;
  timestamp: bigint;
  description: string;
}

interface SpendingBreakdownCardProps {
  spendingRecords: SpendingRecord[];
}

export default function SpendingBreakdownCard({ spendingRecords }: SpendingBreakdownCardProps) {
  const breakdownData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    spendingRecords.forEach((record) => {
      const desc = record.description.toLowerCase();
      let category = 'Other';

      if (desc.includes('food') || desc.includes('meal') || desc.includes('nutrition')) {
        category = 'Food & Nutrition';
      } else if (desc.includes('education') || desc.includes('school') || desc.includes('book')) {
        category = 'Education';
      } else if (desc.includes('medical') || desc.includes('health') || desc.includes('medicine')) {
        category = 'Healthcare';
      } else if (desc.includes('shelter') || desc.includes('housing') || desc.includes('rent')) {
        category = 'Shelter';
      } else if (desc.includes('cloth') || desc.includes('apparel')) {
        category = 'Clothing';
      }

      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Number(record.amount));
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: value / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [spendingRecords]);

  const COLORS = [
    'oklch(0.646 0.222 41.116)',
    'oklch(0.6 0.118 184.704)',
    'oklch(0.398 0.07 227.392)',
    'oklch(0.828 0.189 84.429)',
    'oklch(0.769 0.188 70.08)',
  ];

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (spendingRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No spending records yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
