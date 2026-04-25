import { useState, type FC } from 'react';
import styles from './JumpButton.module.css';

interface JumpButtonProps {
  targetIndex?: number;
  onJump: (index: number) => void;
  disabled?: boolean;
}

export const JumpButton: FC<JumpButtonProps> = ({ targetIndex = 750, onJump, disabled = false }) => {
  const [flashing, setFlashing] = useState(false);

  const handleClick = () => {
    onJump(targetIndex);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
  };

  return (
    <button 
      className={`${styles.button} ${flashing ? styles.flashing : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? "Disabled: image heights invalidate pretext offsets" : undefined}
    >
      {flashing ? 'Jumped!' : `Jump to Item ${targetIndex}`}
    </button>
  );
};
