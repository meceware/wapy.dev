import * as React from "react"

const Layout = ( props ) => {
  return (
    <div id = 'site' className = 'flex flex-col relative px-4'>
      <main className = 'relative flex flex-auto content-center flex-wrap -mx-4 p-4' >
        { props.children }
      </main>
    </div>
  );
};

export default Layout;
