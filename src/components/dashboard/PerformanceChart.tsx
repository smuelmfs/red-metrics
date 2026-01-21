'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PerformanceChartPoint } from '@/modules/dashboards'

interface PerformanceChartProps {
  data: PerformanceChartPoint[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map(item => ({
    name: item.departmentName.length > 15 ? item.departmentName.substring(0, 15) + '...' : item.departmentName,
    'Performance %': item.performancePercentage,
    'Objetivo (k€)': item.objective / 1000,
    'Receita (k€)': item.revenue / 1000
  }))

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Performance por Departamento</h3>
      <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={10}
            interval={0}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Performance %') {
                return [`${value.toFixed(1)}%`, 'Performance']
              }
              return [`€${value.toFixed(1)}k`, name]
            }}
          />
          <Legend />
          <Bar dataKey="Performance %" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

