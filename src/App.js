import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import Form from "./Form";
// import Add from "./Add";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Form} />
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
