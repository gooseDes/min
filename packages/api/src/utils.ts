import { RNFile } from "./types";

/**
 * Converts iso or timestamp to a Date object.
 * @param timestamp The timestamp to convert.
 * @returns The corresponding Date object.
 */
export function toDate(time: string | number): Date {
  if (typeof time === "number") {
    return new Date(time * 1000);
  }
  return new Date(time);
}

/**
 * Converts a Date object to a localized string representation.
 * @param date The date to convert.
 * @param format The locale format to use.
 * @param force24Hour Whether to force 24-hour time format.
 * @returns The localized string representation of the date.
 */
export function dateToString(date: Date, format: Intl.LocalesArgument, force24Hour: boolean): string {
  const now = new Date(Date.now());

  const time = date.toLocaleTimeString(format, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: force24Hour ? false : undefined,
  });

  // Show only time for today, otherwise show date
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return time;
  } else {
    if (
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `Yesterday, ${time}`;
    }
    return `${date.toLocaleDateString(format, { month: "short", day: "numeric" })}, ${time}`;
  }
}

/**
 * Converts RNFile to Blob.
 * @param image The file to convert.
 * @returns converted image.
 */
export async function RNImageToBlob(image: RNFile): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.onerror = () => {
      reject(new Error("Error while converting image to blob"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", image.uri, true);
    xhr.send(null);
  });
}
