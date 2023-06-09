import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Charts, { prepareChart } from './Charts';
import { server } from './settings';

function Product() {
  const [data, setData] = useState(null)
  const { search } = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(search)
  useEffect(() => {
    let productPath = 'product_v2'
    if (query.get('v1')) {
      productPath = 'product'
    }
    fetch(`${server}/${productPath}?gtin=${query.get('gtin')}&region=77&range=120`).then(res => res.json()).then(data => {
      prepareChart(data.chart)
      setData(data)
    })
  }, [])

  return (
    <div className="App">
      <header className="Header">
        <img className="Avatar" src="./Avatar.png" />
        Пользователь
      </header>
      <div className="Content">
        <button className="Back" onClick={() => navigate(-1)}>
          <img src="./back.svg" />
        </button>
        <div className="ProductCard">
          <div className="ProductCard-Showcase">
            <img className="ProductCard-Arrow" src="left-arrow.svg" />
            { data ?
            <img className="ProductCard-Image" src={data.img || "no-image.jpg"} /> :
            <div className="ProductCard-Image" />
            }
            <img className="ProductCard-Arrow" src="right-arrow.svg" />
          </div>
          <div className="ProductCard-Description">
            <h3>{ data?.name }</h3>
            <p>DD5860-011</p>
            <p>Зарегистрирован: 9 июня 2020</p>
          </div>
          <div className="ProductCard-Stats">
            <b>{data?.totalRevenue} у.е.</b>
            <p>Совокупная выручка за период</p>
            <b>{data?.avgRevenue} у.е.</b>
            <p>Выручка за день (среднее)</p>
            <b>{data?.avgPrice} у.е.</b>
            <p>Цена (среднее)</p>
            <b>{data?.avgShops} шт</b>
            <p>Число магазинов (в среднем)</p>
            <b>{data?.avgSalesPerShop} шт</b>
            <p>Продаж на магазин (в среднем)</p>
          </div>
        </div>
        { data &&
        <Charts product={data} />
        }
      </div>
    </div>
  );
}

export default Product;
