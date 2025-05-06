import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import AccountPage from "@/pages/account";
import TasksPage from "@/pages/tasks";
// import ScoringTablePage from "@/pages/scoring-table";
import SignupPage from "./pages/signup";
// import CreateTaskPage from "./pages/create-task";

function App() {
  return (
    <>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<SignupPage />} path="/signup" /> 
        {/* <Route element={<ScoringTablePage />} path="/scoring-table" /> */}
        <Route element={<TasksPage />} path="/tasks" />
        <Route element={<AccountPage />} path="/account" />
        <Route element={<LoginPage />} path="/login" />
        {/* <Route element={<CreateTaskPage />} path="/create-task" /> */}
      </Routes>
    </>
  );
}

export default App;
