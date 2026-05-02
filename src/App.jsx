import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./component/auth/login";
import Dashboard from "./component/dashboard/Dashboard";
import Main from "./component/layout/main";
import CarList from "./component/pages/CarList/CarList";
import CarListCreate from "./component/pages/CarList/CarListCreate";
import Customers from "./component/pages/Customers/Customers";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Main />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/carlist" element={<CarList />} />
            <Route path="/carlist/create" element={<CarListCreate />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
export default App;
