import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Archive from "./pages/Archive";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import GroupJoin from "./pages/GroupJoin";

function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetails />} />
          <Route path="/groups/join/:invitationId" element={<GroupJoin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
