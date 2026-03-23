import { useMemo, useState } from "react";

export default function SlotPicker({ availableSlots = [], onSelect }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const orderedDays = useMemo(() => {
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const uniqueDays = Array.from(new Set(availableSlots.map((s) => s.day).filter(Boolean)));

    return uniqueDays.sort((a, b) => {
      const ai = dayOrder.indexOf(a);
      const bi = dayOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [availableSlots]);

  const handleSelect = (day, time) => {
    setSelectedSlot({ day, time });
    onSelect?.(day, time);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Available Slots</h4>
      <div className="space-y-2">
        {orderedDays.map((day) => {
          const daySlots = availableSlots.find((s) => s.day === day);
          if (!daySlots) return null;

          return (
            <div key={day} className="flex items-start gap-3">
              <span className="text-sm font-medium text-muted-foreground w-10 pt-1.5 shrink-0">{day}</span>
              <div className="flex flex-wrap gap-1.5">
                {daySlots.times.map((time) => {
                  const isSelected = selectedSlot?.day === day && selectedSlot?.time === time;
                  return (
                    <button
                      key={time}
                      onClick={() => handleSelect(day, time)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? "gradient-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selectedSlot && (
        <p className="text-xs text-primary font-medium mt-2">
          Selected: {selectedSlot.day} at {selectedSlot.time}
        </p>
      )}
    </div>
  );
}
