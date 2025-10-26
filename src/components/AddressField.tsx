import React, { useEffect, useRef, useState } from "react";
import styles from "./AddressField.module.scss";
import { VscClose } from "react-icons/vsc";

type AddressFieldProps = {
  onChange?: (addresses: Set<string>) => void;
  value?: Set<string>;
};

export default function AddressField({ onChange, value }: AddressFieldProps) {
  const [addresses, setAddresses] = useState<Set<string>>(new Set());
  const [currentAdress, setCurrentAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => value && setAddresses(value), [value]);

  const changeCurrentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAddress(e.target.value.trim().toLowerCase());
  };

  const validate = () => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(currentAdress)) return;
    const newAddresses = new Set(addresses).add(currentAdress);
    setAddresses(newAddresses);
    onChange?.(newAddresses);
    setCurrentAddress("");
  };

  const nextInput = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") validate();
  };

  const removeAddress = (address: string) => {
    const newAddresses = new Set(addresses);
    newAddresses.delete(address);
    setAddresses(newAddresses);
    onChange?.(newAddresses);
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
