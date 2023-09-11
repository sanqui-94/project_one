namespace App {
  export interface Validable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate<T extends Validable>(obj: T): boolean {
    let valid = true;
    let value: number | string;
    if ("required" in obj && obj.value) {
      valid = true;
    }
    if ("minLength" in obj) {
      value = obj.value as string;
      valid = valid && value.trim().length >= obj.minLength!;
    }
    if ("maxLength" in obj) {
      value = obj.value as string;
      valid = valid && value.trim().length <= obj.maxLength!;
    }
    if ("min" in obj) {
      value = obj.value as number;
      valid = valid && value >= obj.min!;
    }
    if ("max" in obj) {
      value = obj.value as number;
      valid = valid && value <= obj.max!;
    }
    return valid;
  }
}
