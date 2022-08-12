import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './pages/Home'
import Sign from './pages/Sign'
import Game from './pages/Game'
import Computer from './pages/Computer'
import Profile from './pages/Profile'
import Replay from './pages/Replay'
import Admin from './pages/Admin'
import Layout from './components/Layout'
import reportWebVitals from './reportWebVitals';
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const NavigationToHome = (props) => {
  let location = useLocation();
  const context = useOutletContext();
  if(location.pathname === props.route) return(<Navigate to='/' />);
  else return(<Outlet context={context}/>);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="game" element={<Game />} />
          <Route path="computer" element={<Computer />} />
          <Route path="profile" element={<NavigationToHome route={"/profile"} />}>
            <Route path=":username" element={<Profile />} />
          </Route>
          <Route path="replay" element={<NavigationToHome route={"/replay"} />}>
            <Route path=":matchId" element={<Replay />} />
          </Route>
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="/sign" element={<Sign />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
