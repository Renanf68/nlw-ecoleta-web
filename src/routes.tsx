import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

import Home from "./pages/home";
import CreatePoints from "./pages/createpoints";

const Routes = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/cadastro" component={CreatePoints} />
    </BrowserRouter>
  );
};

export default Routes;
