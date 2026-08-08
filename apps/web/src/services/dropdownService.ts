import type { DropdownHandle, DropdownOpenOptions } from "@components/Dropdown";
import React from "react";
import { cancelInterception, interceptClick } from "./interceptService";

export const dropdownRef = React.createRef<DropdownHandle>();

let isDropdownOpen = false;

export function openDropdown(options: Omit<DropdownOpenOptions, "onClose">) {
  const open = () => {
    dropdownRef.current?.open({
      ...options,
      onClose: () => () => {
        cancelInterception();
        isDropdownOpen = false;
      },
    });
    isDropdownOpen = true;
    interceptClick(() => closeDropdown());
  };
  if (isDropdownOpen) {
    closeDropdown();
    setTimeout(open, 200);
  } else {
    open();
  }
}

export function closeDropdown() {
  dropdownRef.current?.close();
  isDropdownOpen = false;
}
