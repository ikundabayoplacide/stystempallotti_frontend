import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes.tsx";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
