import { NavigationProvider } from './context/NavigationContext';
import Home from './pages/Home';

function App() {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gray-100">
        <Home />
      </div>
    </NavigationProvider>
  );
}

export default App;
