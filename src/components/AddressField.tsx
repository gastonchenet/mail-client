import React, { useEffect, useRef, useState } from "react";
import styles from "./AddressField.module.scss";
import { VscClose } from "react-icons/vsc";

type AddressFieldProps = {
  onChange?: (addresses: Set<string>) => void;
};

export default function AddressField({ onChange }: AddressFieldProps) {
  const [addresses, setAddresses] = useState<Set<string>>(new Set());
  const [currentAdress, setCurrentAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => onChange?.(addresses), [addresses]);

  const changeCurrentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAddress(e.target.value.trim().toLowerCase());
  };

  const validate = () => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(currentAdress)) return;
    setAddresses((prev) => new Set(prev).add(currentAdress));
    setCurrentAddress("");
  };

  const nextInput = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") validate();
  };

  const removeAddress = (address: string) => {
    setAddresses((prev) => {
      const newSet = new Set(prev);
      newSet.delete(address);
      return newSet;
    });
  };

  return (
    <div className={styles.addresses}>
      <div className={styles.enteredAddresses}>
        {Array.from(addresses.values()).map((address) => (
          <div className={styles.address} key={address}>
            <p>{address}</p>
            <button
              className={styles.deleteAddress}
              onClick={() => removeAddress(address)}
            >
              <VscClose />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        onKeyDown={nextInput}
        onBlur={validate}
        value={currentAdress}
        onChange={changeCurrentAddress}
        className={styles.input}
        placeholder="Recipients"
        spellCheck={false}
      />
    </div>
  );
}
