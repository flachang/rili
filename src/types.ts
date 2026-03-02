export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'work' | 'personal' | 'important';
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
