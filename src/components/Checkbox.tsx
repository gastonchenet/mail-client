import styles from "./Checkbox.module.scss";

type CheckboxProps = {
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: number;
};

export default function Checkbox({
  label,
  size = 17,
  onChange,
}: CheckboxProps) {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        className={styles.checkbox}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        style={{ height: size, width: size }}
      />
      <svg
        className={styles.checkboxSvg}
        viewBox="0 0 12 10"
        width={size * 0.7}
        height={size * 0.7}
      >
        <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
      </svg>
      <span>{label}</span>
    </label>
  );
}
