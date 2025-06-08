import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(start: string, end: string): string {
    if (!start || !end) return '—';

    const today = DateTime.now().toISODate();

    const startTime = DateTime.fromISO(`${today}T${start}`);
    const endTime = DateTime.fromISO(`${today}T${end}`);

    if (!startTime.isValid || !endTime.isValid) return '—';

    const diff = endTime.diff(startTime, ['hours', 'minutes']);
    const hours = Math.floor(diff.as('hours'));
    const minutes = Math.round(diff.minutes % 60);

    return `${hours}h ${minutes}min`;
  
  }

}
