
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TimeToHireChart() {
  // Example data for time to hire
  const data = [
    { month: 'Jan', time: 28 },
    { month: 'Fev', time: 25 },
    { month: 'Mar', time: 32 },
    { month: 'Abr', time: 29 },
    { month: 'Mai', time: 26 },
    { month: 'Jun', time: 22 },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tempo Médio de Contratação</CardTitle>
        <CardDescription>Em dias, por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} dias`, 'Tempo']}
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.375rem' 
                }}
              />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#df7826"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
