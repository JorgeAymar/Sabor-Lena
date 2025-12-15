'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: { time: string; sales: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e0db" />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#897561', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#897561', fontSize: 12}} />
          <Tooltip 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          />
          <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
