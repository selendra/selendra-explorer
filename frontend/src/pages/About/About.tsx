import React from 'react';
import { TEXTS } from '../../content';

const About: React.FC = () => {
  return (
    <div className="page about-page">
      <div className="container">
        <h1>{TEXTS.about.title}</h1>
        <p>{TEXTS.about.description}</p>
      </div>
    </div>
  );
};

export default About;