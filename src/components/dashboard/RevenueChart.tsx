'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RevenueData {
  month: string
  revenue: number
  objective: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Evolução Mensal - Receita vs Objetivo</h3>
      <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => `€${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="Receita"
          />
          <Line 
            type="monotone" 
            dataKey="objective" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Objetivo"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

