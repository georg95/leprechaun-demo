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
const EMA_SMOOTH = 2 / (1 + 7)

export function prepareChart(chart) {
  let movingPrice = chart[0].price
  let movingCount = chart[0].count
  chart.forEach(day => {
      movingPrice = movingPrice * (1 - EMA_SMOOTH) + day.price * EMA_SMOOTH
      movingCount = movingCount * (1 - EMA_SMOOTH) + day.count * EMA_SMOOTH
      day.price = Math.round(movingPrice)
      day.count = Math.round(movingCount)
  })
  formatChartDate(chart);
}

export function formatChartDate(chart) {
  chart.forEach(day => {
      day.date = moment(day.date).valueOf()
  })
}

function Charts({ chart }) {
  console.log('chart:', chart)
  return (
    <div>
        <div className="SalesChart">
          <h3>Динамика по продажам</h3>
          <ResponsiveContainer
            width="100%"
            height={300}
          >
        <AreaChart
          data={chart}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#118E01" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#118E01" stopOpacity={0}/>
            </linearGradient>
          </defs>
            <XAxis 
              dataKey="date"
              domain={[chart[0].date, chart[chart.length - 1].date]}
              scale="time"
              type="number"
              tickFormatter={dateFormatter} />
            <YAxis />
            <Tooltip labelFormatter={dateFormatter} formatter={(value) => `${value} шт`} />
            <Area
              dot={false}
              animationDuration={400}
              type="monotone"
              dataKey="count"
              name="Продажи"
              strokeWidth={3}
              stroke="#118E01"
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
        <div className="SalesChart">
          <h3>Динамика по ценам</h3>
          <ResponsiveContainer
            width="100%"
            height={300}
          >
          <AreaChart
            data={chart}
          >
            <defs>
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
            <YAxis />
            <Tooltip labelFormatter={dateFormatter} formatter={(value) => `${value} ₽`} />
            <Area
              dot={false}
              animationDuration={400}
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
        <div className="SalesChart">
          <h3>Число магазинов</h3>
          <ResponsiveContainer
            width="100%"
            height={300}
          >
          <AreaChart
            data={chart}
          >
            <defs>
              <linearGradient id="colorShops" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d36163" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d36163" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date"
              domain={[chart[0].date, chart[chart.length - 1].date]}
              scale="time"
              type="number"
              tickFormatter={dateFormatter} />
            <YAxis />
            <Tooltip labelFormatter={dateFormatter} formatter={(value) => `${value} шт`} />
            <Area
              dot={false}
              animationDuration={400}
              type="monotone"
              dataKey="shops"
              name="Магазины"
              strokeWidth={3}
              stroke="#d36163"
              fill="url(#colorShops)"
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
  );
}

export default Charts;
