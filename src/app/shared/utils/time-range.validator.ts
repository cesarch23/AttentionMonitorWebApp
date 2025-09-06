import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateTime } from 'luxon';

/**
 * Valida que endHours sea mayor que startHours
 */
export const timeRangeValidator: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
  const start = formGroup.get('startHours')?.value;
  const end = formGroup.get('endHours')?.value;

  if (!start || !end) return null;

  const today = DateTime.now().toISODate();
  const startTime = DateTime.fromISO(`${today}T${start}`);
  const endTime = DateTime.fromISO(`${today}T${end}`);

  if (!startTime.isValid || !endTime.isValid) return null;

  if (endTime.toMillis() <= startTime.toMillis()) {
    return { invalidTimeRange: true };
  }

  return null;
};
export function getDurationInMinutes(startHours: string, endHours: string): number {
  const today = DateTime.now().toISODate(); // 'yyyy-MM-dd'

  const start = DateTime.fromISO(`${today}T${startHours}`);
  const end = DateTime.fromISO(`${today}T${endHours}`);

  const durationInMinutes = end.diff(start, 'minutes').minutes;

  return durationInMinutes;
}

 