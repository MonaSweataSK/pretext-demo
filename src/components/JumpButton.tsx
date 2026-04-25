import { useState, type FC } from 'react';
import styles from './JumpButton.module.css';

interface JumpButtonProps {
  targetIndex?: number;
  onJump: (index: number) => void;
}

export const JumpButton: FC<JumpButtonProps> = ({ targetIndex = 750, onJump }) => {
  const [flashing, setFlashing] = useState(false);

  const handleClick = () => {
    onJump(targetIndex);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
  };

  return (
    <button 
      className={`${styles.button} ${flashing ? styles.flashing : ''}`}
      onClick={handleClick}
    >
      {flashing ? 'Jumped!' : `Jump to Item ${targetIndex}`}
    </button>
  );
};
