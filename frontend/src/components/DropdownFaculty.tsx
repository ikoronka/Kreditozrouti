import React, { useState } from "react";

type Day = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "TVS";

interface DropdownProps {
    value?: Day;
    onChange?: (value: Day) => void;
    id?: string;
    className?: string;
}

const DropdownFaculty: React.FC<DropdownProps> = ({ value, onChange, id, className }) => {
    const [selected, setSelected] = useState<Day>("0");

    // Keep internal selection synced if parent provides a value
    React.useEffect(() => {
        if (value !== undefined) {
            setSelected(value);
        }
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
            aria-label="Vyberte fakultu"
        >
            <option value="0">Všechny fakulty</option>
            <option value="1">Fakulta financí a účetnictví</option>
            <option value="2">Fakulta mezinárodních vztahů</option>
            <option value="3">Fakulta podnikohospodářská</option>
            <option value="4">Fakulta informatiky a statistiky</option>
            <option value="5">Národohospodářská fakulta</option>
            <option value="6">Fakulta managementu</option>
            <option value="TVS">Centrum tělesné výchovy a sportu</option>
        </select>
    );
};

export default DropdownFaculty;