import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Product from './Product';
import TopProducts from './TopProducts';

import './index.css';


const router = createBrowserRouter([
  {
    path: '/',
    element: <TopProducts />,
  },
  {
    path: '/product',
    element: <Product />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


