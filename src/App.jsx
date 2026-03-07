import React, { useEffect } from 'react';
import Router from './Router';
import AOS from 'aos';

export default function App(){
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  return <Router />;
}