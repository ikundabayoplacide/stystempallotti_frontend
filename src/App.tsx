import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { UIPermissionsProvider } from "./context/UIPermissionsContext";
import { WorkflowProvider } from "./context/WorkflowContext";
import AppRoutes from "./routes/AppRoutes.tsx";

function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <UIPermissionsProvider>
          <AppRoutes />
          <ToastContainer />
        </UIPermissionsProvider>
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;
