import React from 'react';

export interface ListItemProps {
  ident: string;
  name: string;
  ects: number;
  year: string;
  url?: string;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ ident, name, ects, year, url, onClick }) => {
  const content = (
    <div className="listitem-content">
      <div className="listitem-row">
        <strong className="listitem-ident">{ident}</strong>
        <span className="listitem-ects">{ects} ECTS</span>
      </div>
      <div className="listitem-name">{name}</div>
      <div className="listitem-year">{year}</div>
    </div>
  );

  return (
    <li role="listitem" className="listitem" onClick={onClick}>
      {url ? (
        <a href={url} target='_blank' className="listitem-link">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
};

export default ListItem;