import { useState, useEffect } from "react";

const Counter = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
    if (target === 0) { 
      setDisplay(0); 
      return; 
    }
    
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { 
        setDisplay(target); 
        clearInterval(timer); 
      } else {
        setDisplay(start);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [value]);
  
  const formatted = Number.isInteger(parseFloat(String(value).replace(/[^0-9.]/g, "")))
    ? Math.round(display).toLocaleString()
    : display.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
  return <span>{prefix}{formatted}{suffix}</span>;
};

export default Counter;
