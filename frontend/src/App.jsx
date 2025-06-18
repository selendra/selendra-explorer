import { Layout } from './components';
import { Home } from './pages';
import { APP_CONFIG } from './config/app.config';
import './App.css';

function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

export default App;