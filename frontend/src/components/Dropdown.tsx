import React, { useState } from "react";

type Day = "Po" | "Út" | "St" | "Čt" | "Pá";

interface DropdownProps {
    value?: Day;
    onChange?: (value: Day) => void;
    id?: string;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ value, onChange, id, className }) => {
    const [selected, setSelected] = useState<Day>(value ?? "Po");

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
            <option value="Po">Po</option>
            <option value="Út">Út</option>
            <option value="St">St</option>
            <option value="Čt">Čt</option>
            <option value="Pá">Pá</option>
        </select>
    );
};

export default Dropdown;