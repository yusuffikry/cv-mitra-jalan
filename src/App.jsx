import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./component/auth/login";
import Dashboard from "./component/dashboard/Dashboard";
import Main from "./component/layout/main";
import CarList from "./component/pages/CarList/CarList";
import CarListCreate from "./component/pages/CarList/CarListCreate";
import Customers from "./component/pages/Customers/Customers";
import MainTransaction from "./component/pages/Transaction/MainTransaction";
import ShowTransaction from "./component/pages/Transaction/ShowTransaction";
import CustomersCreate from "./component/pages/Customers/CustomersCreate";
import CreateTransaction from "./component/pages/Transaction/CreateTransaction";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Main />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Car List Routes */}
            <Route path="/carlist" element={<CarList />} />
            <Route path="/carlist/create" element={<CarListCreate />} />

            {/* Customers Routes */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/create" element={<CustomersCreate />} />

            {/* Transaction Routes */}
            <Route path="/transaction" element={<MainTransaction />} />
            <Route path="/transaction/:id" element={<ShowTransaction />} />
            <Route path="/transaction/create" element={<CreateTransaction />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
export default App;
