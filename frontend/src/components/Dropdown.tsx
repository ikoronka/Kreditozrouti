import React, { useState } from "react";

type Day = "Pondělí" | "Úterý" | "Středa" | "Čtvrtek" | "Pátek";

interface DropdownProps {
    value?: Day;
    onChange?: (value: Day) => void;
    id?: string;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ value, onChange, id, className }) => {
    const [selected, setSelected] = useState<Day>(value ?? "Pondělí");

    // Keep internal selection synced if parent provides a value
    React.useEffect(() => {
        if (typeof value !== "undefined") setSelected(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as Day;
        setSelected(val);
        onChange?.(val);
    };

    return (
        <select
            id={id}
            className={className}
            value={selected}
            onChange={handleChange}
            aria-label="Vyberte den"
        >
            <option value="Pondělí">Pondělí</option>
            <option value="Úterý">Út</option>
            <option value="Středa">St</option>
            <option value="Čtvrtek">Čt</option>
            <option value="Pátek">Pá</option>
        </select>
    );
};

export default Dropdown;