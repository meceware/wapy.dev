import React from 'react';
import { Link as GatsbyLink } from "gatsby";

const Link = ( { children, to, activeClassName, partiallyActive, out, ...other } ) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const pattern = /^https?:\/\/|^\/\//i;
  const internal = out ? false : ( ! pattern.test( to ) );
  // Use Gatsby Link for internal links, and <a> for others
  if ( internal ) {
    return (
      <GatsbyLink
        to = { to }
        activeClassName = { activeClassName }
        partiallyActive = { partiallyActive }
        { ...other }
      >
        { children }
      </GatsbyLink>
    );
  }

  return (
    <a href = { to } { ...other } rel = { other.target === '_blank' ? 'noopener noreferrer' : undefined } data-out = 'true'>
      { children }
    </a>
  );
};

Link.defaultProps = {
  out: false,
};

export default Link;
