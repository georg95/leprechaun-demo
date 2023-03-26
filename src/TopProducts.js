import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Select from 'react-select'
import { prepareChart } from './Charts';
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
    { value: '1', label: 'одежда' },
    { value: '2', label: 'обувь' },
    { value: '3', label: 'спортивные костюмы' },
    { value: '4', label: 'мужские спортивные костюмы' },
    { value: '5', label: 'женские спортивные костюмы' },
]


function TopProducts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [region, setRegion] = useState(regions[0])
  const [period, setPeriod] = useState(periods[2])
  const [group, setGroup] = useState(searchParams.get('group') ?
    groups.find(group => group.value === searchParams.get('group')) : null)
  const [data, setData] = useState([])
  const updateGroup = useCallback((group) => {
    setGroup(group)
    setSearchParams({ group: group.value })
  }, [setGroup, setSearchParams])

 
  useEffect(() => {
    setData([])
    if (!group) {
      return
    }
    fetch(`http://${window.location.hostname}:1234/top?region=${region.value}&range=${period.value}`).then(res => res.json()).then(data => {
      console.log(data)
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
            <Select options={regions} value={region} onChange={setRegion} />
            <Select options={periods} value={period} onChange={setPeriod} />
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
                className="TopProductCard"
                to={`/product?gtin=${product.gtin}`}
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
