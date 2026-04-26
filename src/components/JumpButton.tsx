import { useState, type FC } from 'react';
import styles from './JumpButton.module.css';

interface JumpButtonProps {
  maxIndex: number;
  onJump: (index: number) => void;
  disabled?: boolean;
}

export const JumpButton: FC<JumpButtonProps> = ({ maxIndex, onJump, disabled = false }) => {
  const [flashing, setFlashing] = useState(false);

  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * maxIndex);
    onJump(randomIndex);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
  };

  return (
    <button 
      className={`${styles.button} ${flashing ? styles.flashing : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      disabled={disabled || maxIndex <= 0}
    >
      {flashing ? 'Jumped!' : `Jump to Random Section`}
    </button>
  );
};
