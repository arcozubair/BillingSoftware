import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const AnimatedText = ({ text, sx = {} }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const [greeting, name] = text.split(',');
      textRef.current.innerHTML = `
        <div class='text-container'>
          <div class='text-wrapper'>
            <span class='greeting'>${greeting},</span>
            <span class='name'>${name}</span>
          </div>
        </div>
      `;

      anime.timeline()
        .add({
          targets: '.greeting-text .greeting',
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 800,
          easing: 'easeOutExpo'
        })
        .add({
          targets: '.greeting-text .name',
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 800,
          easing: 'easeOutExpo',
          delay: 200
        });
    }
  }, [text]);

  return (
    <>
      <style>
        {`
          .greeting-text {
                textAlign: 'center',
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 8;
            padding: 0;
            line-height: 1.2;
            width: 100%;

            }
          .text-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          .text-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: flex-start;
          }
          .greeting-text .greeting {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
          }
          .greeting-text .name {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
          }
          .mobile-divider {
            display: none;
          }
          @media (max-width: 600px) {
            .text-wrapper {
              justify-content: center;
              gap: 4px;
              margin-bottom: 0px;
            }
            .greeting-text .greeting,
            .greeting-text .name {
              font-size: 1rem;
            }
            .mobile-divider {
              display: block;
              width: 80px;
              height: 3px;
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              border-radius: 1.5px;
              margin-top: 4px;
            }
          }
          @media (max-width: 400px) {
            .greeting-text .greeting,
            .greeting-text .name {
              font-size: 1rem;
            }
            .mobile-divider {
              width: 60px;
              height: 2px;
            }
          }
        `}
      </style>
      <h1 className="greeting-text" ref={textRef} style={{...sx, marginBottom: '1.5rem'}}>{text}</h1>
    </>
  );
};

export default AnimatedText;
