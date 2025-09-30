import { useState, useEffect } from 'react';
import Counter from './Counter';

// helper function
function getTimeRemaining(targetDate) {
  const total = Date.parse(targetDate) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}

export default function Countdown({ toDateStr }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(toDateStr));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(toDateStr));
    }, 1000);

    return () => clearInterval(timer); // cleanup on unmount
  }, [toDateStr]);

  if (timeLeft.total <= 0) {
    return <span>Countdown finished!</span>;
  }

  return (
    <span style={{ fontSize: 60,  }}>
      <Counter value={timeLeft.days} followUp='d'/>
      <Counter value={timeLeft.hours} places={[10, 1]} followUp='h'/>
      <Counter value={timeLeft.minutes} places={[10, 1]} followUp='m'/>
      <Counter value={timeLeft.seconds} places={[10, 1]} followUp='s'/>
    </span>
  );
}

