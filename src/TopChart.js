import moment from 'moment/min/moment-with-locales';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

moment.locale('ru')
const dateFormatter = date => {
  return moment(date).format('MMM DD')
}

function TopChart({ product }) {

  const { chart, name } = product
  return (
    <div className="TopChart">
      <h3>{ name }</h3>
      <div className="TopChartLegend">
        Динамика продаж
        <div className="TopChartGreenDot" />
        <span>Продажи</span>
        <div className="TopChartBlueDot" />
        <span>Цена</span>
      </div>
      <ResponsiveContainer
        width="100%"
        height={220}
      >
        <AreaChart
          data={chart}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#118E01" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#118E01" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D75FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0D75FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date"
            domain={[chart[0].date, chart[chart.length - 1].date]}
            scale="time"
            type="number"
            tickFormatter={dateFormatter} />
          <YAxis yAxisId="left"></YAxis>
          <YAxis yAxisId="right" orientation="right"></YAxis>
          
          <Tooltip
            labelFormatter={dateFormatter}
            formatter={(value, name) => {
              return name === 'Продажи' ? `${value} шт` : `${value} ₽`
            }} />
          <Area
            dot={false}
            animationDuration={400}
            yAxisId="left"
            type="monotone"
            dataKey="count"
            name="Продажи"
            strokeWidth={3}
            stroke="#118E01"
            fill="url(#colorCount)"
          />
          <Area
            dot={false}
            animationDuration={400}
            yAxisId="right"
            type="monotone"
            dataKey="price"
            name="Цена"
            strokeWidth={3}
            stroke="#0D75FF"
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopChart;
