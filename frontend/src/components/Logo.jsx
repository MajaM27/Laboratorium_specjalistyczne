import Icon from './Icon.jsx';

export default function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <Icon name="paw" size={21} />
      </span>
      <span>PetCare</span>
    </div>
  );
}
