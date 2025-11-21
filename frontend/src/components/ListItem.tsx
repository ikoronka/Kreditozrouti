import React from 'react';

interface ListItemProps {
  ident: string;
  name: string;
  ects: number;
  year: string;
  onClick?: () => void;
}

export const ListItem = ({ 
  ident,
  name,
  ects,
  year,
  onClick 
}: ListItemProps) => {
  return (
    <div 
      role="listitem"
      onClick={onClick}
    >
      <div>
        <div>
          <span>
            {ident}
          </span>
          <span>
            {name}
          </span>
          <span>
            {ects}
          </span>
          <span>
            {year}
          </span>
        </div>
      </div>

    </div>
  );
};

export default ListItem;