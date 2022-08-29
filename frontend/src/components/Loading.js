import LoadingLogo from '../assets/loading.png';
import React from 'react';
import Lottie from 'lottie-react';
import loading from '../assets/loadings/loading5.json';

function Loading() {
  return (
    <div className="loading-container">
      <Lottie animationData={loading} loop={true} />
      <p>Loading...</p>
    </div>
  );
}

function Error() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '200px',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
      }}
    >
      <img className="loading-img" alt="loading" src={LoadingLogo} />
    </div>
  );
}

export { Loading, Error };
