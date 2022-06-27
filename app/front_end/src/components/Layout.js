import './Layout.css';
import {Outlet} from "react-router-dom";

function Layout() {
    return (<div>
      <p>I AM LAYOUT</p>
      <Outlet />
    </div>
    );
  }
  
export default Layout;
  