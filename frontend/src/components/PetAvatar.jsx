import { petColors } from '../utils/petColors.js';

// Kafelek zwierzęcia – kolor zależny od id, inicjał imienia (aplikacja nie przechowuje zdjęć)
export default function PetAvatar({ pet, size = 46, radius = 13, className = '' }) {
  const [bg, fg] = petColors(pet.id);
  return (
    <span
      className={`pet-avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        color: fg,
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {pet.name?.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
