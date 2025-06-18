import { Layout } from './components';
import { Home } from './pages';
import { APP_CONFIG } from './config/app.config';
import './App.css';

const App: React.FC = () => {
  return (
    <Layout>
      <Home />
    </Layout>
  );
};

export default App;