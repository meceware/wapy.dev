import * as React from "react"

const Section = ( props ) => {
  return (
    <section className = 'relative w-full py-2'>
      <div className = 'container mx-auto'>
        { props.children }
      </div>
    </section>
  );
};

export default Section;
