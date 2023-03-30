import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

import Product from './Product';
import TopProducts from './TopProducts';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path='/' element={<TopProducts />} />
        <Route exact path='/product' element={<Product />}/>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);


