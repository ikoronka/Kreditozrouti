import React, { useEffect, useState } from "react";
import "../styles/time.css";

type TimeProps = {
    value?: string;
    onChange?: (time: string) => void;
    className?: string;
    disabled?: boolean;
    hourMin?: number;
    hourMax?: number;
    minuteStep?: number;
};

/**
 * Time select with separate hour and minute controls.
 * - Uses number inputs for direct typing or arrow increment.
 * - Normalizes to "HH:MM" and reports via onChange.
 */
const Time: React.FC<TimeProps> = ({
    value = "00:00",
    onChange,
    className,
    disabled = false,
    hourMin = 0,
    hourMax = 23,
    minuteStep = 1,
}) => {
    const pad = (n: number | string, width = 2) => String(n).padStart(width, "0");

    const parse = (val: string) => {
        const parts = val.split(":");
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (Number.isNaN(h)) h = hourMin;
        if (Number.isNaN(m)) m = 0;
        return {
            hours: Math.min(Math.max(h, hourMin), hourMax),
            minutes: Math.min(Math.max(m, 0), 59),
        };
    };

    const normalized = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

    const initial = parse(value);
    const [hours, setHours] = useState<number>(initial.hours);
    const [minutes, setMinutes] = useState<number>(initial.minutes);

    // keep internal state in sync when external value changes
    useEffect(() => {
        const p = parse(value);
        setHours(p.hours);
        setMinutes(p.minutes);
    }, [value, hourMin, hourMax]);

    // notify parent on changes
    useEffect(() => {
        onChange?.(normalized(hours, minutes));
    }, [hours, minutes]);

    const handleHourChange = (raw: string) => {
        const n = raw === "" ? hourMin : Number(raw);
        if (Number.isNaN(n)) return;
        const clamped = Math.min(Math.max(Math.floor(n), hourMin), hourMax);
        setHours(clamped);
    };

    const handleMinuteChange = (raw: string) => {
        const n = raw === "" ? 0 : Number(raw);
        if (Number.isNaN(n)) return;
        // snap to step
        let stepped = Math.round(n / Math.max(1, minuteStep)) * minuteStep;
        stepped = Math.min(Math.max(Math.floor(stepped), 0), 59);
        setMinutes(stepped);
    };

    const changeHoursBy = (delta: number) => {
        setHours((prev) => {
            let next = prev + delta;
            next = Math.min(Math.max(next, hourMin), hourMax);
            return next;
        });
    };

    const changeMinutesBy = (delta: number) => {
        setMinutes((prev) => {
            const step = Math.max(1, minuteStep);
            let next = prev + delta * step;
            next = Math.min(Math.max(next, 0), 59);
            return next;
        });
    };

    return (
        <div className={`time ${className ?? ""}`} aria-disabled={disabled}>
            <div className="time-field">
                <div className="time-label">Hours</div>
                <div className="time-control">
                    <input
                        className="time-input"
                        aria-label="Hours"
                        type="number"
                        value={hours}
                        onChange={(e) => handleHourChange(e.target.value)}
                        onBlur={(e) => handleHourChange(e.target.value)}
                        min={hourMin}
                        max={hourMax}
                        disabled={disabled}
                    />
                    <div className="time-btn-group">
                        <button
                            type="button"
                            className="time-btn time-btn-up"
                            aria-label="Increment hours"
                            onClick={() => changeHoursBy(1)}
                            disabled={disabled || hours >= hourMax}
                        />
                        <button
                            type="button"
                            className="time-btn time-btn-down"
                            aria-label="Decrement hours"
                            onClick={() => changeHoursBy(-1)}
                            disabled={disabled || hours <= hourMin}
                        />
                    </div>
                </div>
            </div>

            <div className="time-sep" aria-hidden>
                :
            </div>

            <div className="time-field">
                <div className="time-label">Minutes</div>
                <div className="time-control">
                    <input
                        className="time-input"
                        aria-label="Minutes"
                        type="number"
                        value={minutes}
                        onChange={(e) => handleMinuteChange(e.target.value)}
                        onBlur={(e) => handleMinuteChange(e.target.value)}
                        min={0}
                        max={59}
                        step={minuteStep}
                        disabled={disabled}
                    />
                    <div className="time-btn-group">
                        <button
                            type="button"
                            className="time-btn time-btn-up"
                            aria-label="Increment minutes"
                            onClick={() => changeMinutesBy(1)}
                            disabled={disabled || minutes >= 59}
                        />
                        <button
                            type="button"
                            className="time-btn time-btn-down"
                            aria-label="Decrement minutes"
                            onClick={() => changeMinutesBy(-1)}
                            disabled={disabled || minutes <= 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Time;