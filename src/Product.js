import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Charts, { formatChartDate, prepareChart } from './Charts';

function Product() {
  const [data, setData] = useState(null)
  const { search } = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(search)
  useEffect(() => {
    fetch(`http://${window.location.hostname}:1234/product?gtin=${query.get('gtin')}&region=77&range=120`).then(res => res.json()).then(data => {
      prepareChart(data.chart)
      formatChartDate(data.shops)
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
            <p>Бренд: <u>Nike</u></p>
            <p>Зарегистрирован: 9 июня 2020</p>
            <p>Размеры изделия: S (36-38), M(40-42), L(44-46), XL(48-50)</p>
            <p>Цвета: темно синий, серый, темно-бирюзовый, коричневый, хаки, черный, бордовый</p>
            <p>
              Описание:<br />
              <span className="ProductCard-DescriptionText">
                Свободный трикотажный костюм двойка состоит из однотонных длинных прямых брюк джоггеров с завязками и широкой резинкой на поясе и снизу и кофты худи на молнии замке с капюшоном и рукавами из трикотажной 3-нитки. Обтягивающая хлопковая ткань толстовки олимпийки и штанов джогеров. Тренировочный прогулочный комплект для туристической, гимнастической, походной, велосипедной, баскетбольной, танцевальной...
              </span>
            </p>
          </div>
        </div>
        { data &&
        <Charts chart={data.chart} shops={data.shops} />
        }
      </div>
    </div>
  );
}

export default Product;
