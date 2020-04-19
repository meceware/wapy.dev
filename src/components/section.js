import React from 'react';

export default ( props ) => {
  return (
    <section className = 'relative w-full py-2'>
      <div className = 'container mx-auto'>
        { props.children }
      </div>
    </section>
  );
};
