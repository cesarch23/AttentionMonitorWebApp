import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon'
@Pipe({
  name: 'sessionStatus',
  standalone: true
})
export class SessionStatusPipe implements PipeTransform {

  transform(date: unknown, startHours?: unknown, endHours?: unknown): 'PENDIENTE' | 'EN PROGRESO' | 'FINALIZADO' | '—' {
    const sessionDate = typeof date === 'string' ? date : null;
    const start = typeof startHours === 'string' ? startHours : null;
    const end = typeof endHours === 'string' ? endHours : null;

    if (!sessionDate || !start || !end) return '—';

    const now = DateTime.now();
    const startDateTime = DateTime.fromISO(`${sessionDate}T${start}`);
    const endDateTime = DateTime.fromISO(`${sessionDate}T${end}`);

    if (!startDateTime.isValid || !endDateTime.isValid) return '—';

    if (now < startDateTime) {
      return 'PENDIENTE';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'EN PROGRESO';
    } else {
      return 'FINALIZADO';
    }
  }

}
