import LoadingLogo from '../assets/loading.png';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '200px',
        alignItems: 'center',
      }}
    >
      <img className="loading-img" alt="loading" src={LoadingLogo} />
    </div>
  );
}
