import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Select from 'react-select'
import { prepareChart } from './Charts';
import { server } from './settings';
import TopChart from './TopChart';

const topType = [
    { value: 'top-sales', label: 'Топ продаж' }
]

const regions = [
  { value: '77', label: 'Москва' },
  { value: '78', label: 'Санкт-Петербург' },
  { value: '52', label: 'Нижегородская область' }
]

const periods = [
    { value: '7', label: 'неделя' },
    { value: '30', label: 'месяц' },
    { value: '90', label: 'квартал' },
    { value: '360', label: 'год' }
]

const groups = [
    { value: '1', label: 'вода' },
    { value: '2', label: 'вода минеральная' },
    { value: '3', label: 'вода минеральная негазированная' },
    { value: '4', label: 'вода минеральная негазированная 0.5л' },
]


function TopProducts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [region, setRegion] = useState(searchParams.get('region') ?
    regions.find(region => region.value === searchParams.get('region')) : regions[0])
  const [period, setPeriod] = useState(searchParams.get('period') ?
    periods.find(period => period.value === searchParams.get('period')) : periods[2])
  const [group, setGroup] = useState(searchParams.get('group') ?
    groups.find(group => group.value === searchParams.get('group')) : null)
  const [data, setData] = useState([])
  const updateRegion = useCallback((region) => {
    setRegion(region)
    searchParams.set('region', region.value)
    setSearchParams(searchParams)
  }, [setRegion, searchParams, setSearchParams])
  const updatePeriod = useCallback((period) => {
    setPeriod(period)
    searchParams.set('period', period.value)
    setSearchParams(searchParams)
  }, [setRegion, searchParams, setSearchParams])
  const updateGroup = useCallback((group) => {
    setGroup(group)
    searchParams.set('group', group.value)
    setSearchParams(searchParams)
  }, [setGroup, searchParams, setSearchParams])

 
  useEffect(() => {
    setData([])
    if (!group) {
      return
    }
    fetch(`${server}/top?region=${region.value}&range=${period.value}`).then(res => res.json()).then(data => {
      data.forEach(({ chart }) => prepareChart(chart))
      setData(data)
    })
  }, [group, region, period])
  return (
    <div className="App">
      <header className="Header">
        <img className="Avatar" src="./Avatar.png" />
        Пользователь
      </header>
      <div className="Content">
        <div className="Selects">
            <Select options={regions} value={region} onChange={updateRegion} />
            <Select options={periods} value={period} onChange={updatePeriod} />
            <Select
              value={group}
              options={groups}
              onChange={updateGroup}
              placeholder= "Поиск товара..."
              openMenuOnClick={false}
            />
        </div>

        { data.length > 0 &&
          <Select className="SelectTopType" options={topType} value={topType[0]} />
        }
        { data.map((product) => (
            <Link
                key={product.gtin}
                className="TopProductCard"
                to={`product?gtin=${product.gtin}`}
                style={{ textDecoration: 'none' }}
            >
                <img className="TopProductCard-Image" src={product.img || 'no-image.jpg'} />
                <div className="TopProductCard-Delimeter" />
                <TopChart product={product} />
            </Link>))
        }
      </div>
    </div>
  );
}

export default TopProducts;
