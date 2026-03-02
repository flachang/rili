import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CalendarEvent, DayInfo } from './types';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Design Sync', date: new Date(), type: 'work' },
    { id: '2', title: 'Coffee with Sarah', date: addDays(new Date(), 2), type: 'personal' },
    { id: '3', title: 'Project Deadline', date: addDays(new Date(), 5), type: 'important' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, monthStart),
      isToday: isSameDay(date, new Date()),
      events: events.filter(event => isSameDay(event.date, date))
    }));
  }, [currentDate, events]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedDate) return;

    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      date: selectedDate,
      type: 'personal'
    };

    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setIsModalOpen(false);
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(event.date, selectedDate));
  }, [selectedDate, events]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calendar Header & Grid */}
        <div className="lg:col-span-8">
          <header className="flex items-center justify-between mb-12">
            <div className="relative">
              <motion.h1 
                key={format(currentDate, 'MMMM')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-8xl font-serif font-light tracking-tight text-zinc-900"
              >
                {format(currentDate, 'MMMM')}
              </motion.h1>
              <span className="text-xl font-mono text-zinc-400 mt-2 block">
                {format(currentDate, 'yyyy')}
              </span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={prevMonth}
                className="p-3 rounded-full border border-zinc-200 hover:bg-white transition-colors"
                id="prev-month-btn"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-3 rounded-full border border-zinc-200 hover:bg-white transition-colors"
                id="next-month-btn"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </header>

          <div className="calendar-grid border-t border-l border-zinc-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-xs font-mono uppercase tracking-widest text-zinc-400 border-r border-b border-zinc-200 bg-zinc-50/50">
                {day}
              </div>
            ))}
            {days.map((day, idx) => (
              <motion.div
                key={day.date.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.01 }}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "day-cell p-3 border-r border-b border-zinc-200 cursor-pointer transition-all relative group",
                  !day.isCurrentMonth && "bg-zinc-50/30 text-zinc-300",
                  day.isCurrentMonth && "bg-white hover:bg-zinc-50",
                  selectedDate && isSameDay(day.date, selectedDate) && "ring-2 ring-inset ring-zinc-900 z-10"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  day.isToday && "w-7 h-7 flex items-center justify-center bg-zinc-900 text-white rounded-full"
                )}>
                  {format(day.date, 'd')}
                </span>
                
                <div className="mt-2 space-y-1">
                  {day.events.slice(0, 2).map(event => (
                    <div 
                      key={event.id} 
                      className={cn(
                        "h-1.5 rounded-full w-full",
                        event.type === 'work' && "bg-indigo-400",
                        event.type === 'personal' && "bg-emerald-400",
                        event.type === 'important' && "bg-rose-400"
                      )}
                    />
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-[10px] font-mono text-zinc-400">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Day Details & Events */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 sticky top-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-medium">
                  {selectedDate ? format(selectedDate, 'EEEE') : 'Select a day'}
                </h2>
                <p className="text-zinc-500 font-mono text-sm mt-1">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                id="add-event-btn"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-colors"
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1.5 shrink-0",
                        event.type === 'work' && "bg-indigo-400",
                        event.type === 'personal' && "bg-emerald-400",
                        event.type === 'important' && "bg-rose-400"
                      )} />
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-900">{event.title}</h3>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs mt-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>All Day</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-zinc-200" />
                    </div>
                    <p className="text-zinc-400 text-sm italic">No events scheduled for today.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif font-medium">New Event</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Event Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full px-0 py-2 text-xl border-b-2 border-zinc-100 focus:border-zinc-900 outline-none transition-colors"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
