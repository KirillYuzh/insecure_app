import NavigationBar from "./components/NavigationBarComponent"
import { ToastContainer } from 'react-toastify';


export default function App() {
  return (
    <div className='App' data-bs-theme="dark">
      <NavigationBar/>
      <ToastContainer />
    </div>
  );
}