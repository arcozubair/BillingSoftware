import React, { useEffect, useState } from 'react';

const fadeInKeyframes = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const addKeyframes = () => {
  const style = document.createElement('style');
  style.innerHTML = fadeInKeyframes;
  document.head.appendChild(style);
};

function EnhancedFooter() {
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    addKeyframes();

    // Detect if the browser is Chrome
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      setIsChrome(true);
    }
  }, []);

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      fontFamily: '"Roboto", sans-serif', 
      fontSize: '12px', 
      color: '#FFFAF0', 
      borderTop: '2px solid white', 
      marginTop: 'auto', 
      marginBottom: isChrome ? '80px' : '0', // Conditional margin
      animation: 'fadeIn 2s ease-out',
      borderRadius: '4px', // Slightly rounded corners
      letterSpacing: '0.9px', // Slightly increased letter spacing
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)' // Subtle text shadow for depth
    }}>
      Developed by Zubair 
    </div>
  );
}

export default EnhancedFooter;
