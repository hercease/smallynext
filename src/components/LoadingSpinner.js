// components/LoadingSpinner.js
import { useEffect } from 'react';
import Image from 'next/image';

const LoadingSpinner = ({ show = false, text = "Loading..." }) => {
  // Prevent body scroll when spinner is shown
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <style jsx>{`
        .loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          justify-content: center;
          align-items: center;
          flex-direction: column;
          display: flex;
          z-index: 9999;
        }

        .loader-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80px;
          height: 80px;
        }

        .rotating-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid transparent;
          border-top: 5px solid #9bba4d;
          border-right: 5px solid #1c3a86;
          animation: spin 1.5s linear infinite;
        }

        .logo {
          position: absolute;
          width: 45px;
          height: 45px;
          object-fit: contain;
          border-radius: 50%;
          /* Center the logo perfectly */
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
      `}</style>

      <div className="loader-container">
        <div className="loader-wrapper">
          <div className="rotating-circle"></div>
          <Image 
            src="/favicon.ico" 
            alt="Logo" 
            className="logo"
            width={45}
            height={45}
          />
        </div>
        <div className="loading-text">{text}</div>
      </div>
    </>
  );
};

export default LoadingSpinner;