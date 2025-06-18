import { TEXTS } from '../../content';

const Home = () => {
  return (
    <div className="page home-page">
      <div className="container">
        <h1>{TEXTS.home.title}</h1>
        <h2>{TEXTS.home.subtitle}</h2>
        <p>{TEXTS.home.description}</p>
      </div>
    </div>
  );
};

export default Home;