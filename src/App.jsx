import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./component/auth/login";
import Dashboard from "./component/dashboard/Dashboard";
import Main from "./component/layout/main";
import CarList from "./component/pages/CarList/CarList";
import CarListCreate from "./component/pages/CarList/CarListCreate";
import EditCarList from "./component/pages/CarList/EditCarList";

import Customers from "./component/pages/Customers/Customers";
import CustomersCreate from "./component/pages/Customers/CustomersCreate";
import EditCustomer from "./component/pages/Customers/EditCustomer";

import MainTransaction from "./component/pages/Transaction/MainTransaction";
import ShowTransaction from "./component/pages/Transaction/ShowTransaction";
import EditTransaction from "./component/pages/Transaction/EditTransaction";
import CreateTransaction from "./component/pages/Transaction/CreateTransaction";

import Income from "./component/pages/Profit/Income";
import CreateIncome from "./component/pages/Profit/CreateIncome";
import ShowIncome from "./component/pages/Profit/Showincome";

import Outcome from "./component/pages/Profit/Outcome";
import CreateOutcome from "./component/pages/Profit/CreateOutcome";
import ShowOutcome from "./component/pages/Profit/ShowOutcome";

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
            <Route path="/carlist/edit/:id" element={<EditCarList />} />

            {/* Customers Routes */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/create" element={<CustomersCreate />} />
            <Route path="/customers/edit/:id" element={<EditCustomer />} />

            {/* Transaction Routes */}
            <Route path="/transaction" element={<MainTransaction />} />
            <Route path="/transaction/:id" element={<ShowTransaction />} />
            <Route path="/transaction/create" element={<CreateTransaction />} />
            <Route path="/transaction/edit/:id" element={<EditTransaction />} />

            {/* profit routes  */}
            <Route path="/income" element={<Income />} />
            <Route path="/income/create" element={<CreateIncome />} />
            <Route path="/income/show" element={<ShowIncome />} />

            <Route path="/outcome" element={<Outcome />} />
            <Route path="/outcome/create" element={<CreateOutcome />} />
            <Route path="/outcome/show" element={<ShowOutcome />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
export default App;
