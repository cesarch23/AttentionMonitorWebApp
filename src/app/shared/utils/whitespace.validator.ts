import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function whitespaceValidator(): ValidatorFn  {
    return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si no hay valor, dejar que required lo maneje
    }
    const isWhitespace = control.value.toString().trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  };
}