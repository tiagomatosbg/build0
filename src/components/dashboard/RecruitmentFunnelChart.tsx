
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelDataItem {
  name: string;
  value: number;
  color: string;
}

export function RecruitmentFunnelChart() {
  // Example data for the recruitment funnel
  const data: FunnelDataItem[] = [
    {
      name: 'Inscritos',
      value: 120,
      color: '#94A3B8', // slate-400
    },
    {
      name: 'Triagem',
      value: 82,
      color: '#60A5FA', // blue-400
    },
    {
      name: 'Testes',
      value: 43,
      color: '#34D399', // emerald-400
    },
    {
      name: 'Entrevistas',
      value: 25,
      color: '#FBBF24', // amber-400
    },
    {
      name: 'Proposta',
      value: 12,
      color: '#F472B6', // pink-400
    },
    {
      name: 'Admissão',
      value: 8,
      color: '#df7826', // company orange
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Funil de Recrutamento</CardTitle>
        <CardDescription>Visão geral do pipeline de candidatos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 30,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                scale="point" 
                width={100} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`${value} candidatos`, '']}
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.375rem' 
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
