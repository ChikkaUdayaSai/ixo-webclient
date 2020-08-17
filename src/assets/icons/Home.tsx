import React from "react";

const Home = (props: any): JSX.Element => {
  return (
    <svg
      width={props.width || 18}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.37 9.7l-3.89-4.1V2.9a.47.47 0 00-.5-.5.47.47 0 00-.5.5v1.7l-3.2-3.4c-.11 0-.2-.1-.3-.1s-.2.1-.31.1l-8 8.4a.48.48 0 000 .7.38.38 0 00.6 0l1.1-1.1v7.2a.48.48 0 00.5.5h3.8a.47.47 0 00.5-.5V13h3v3.4a.47.47 0 00.5.5h3.81a.47.47 0 00.5-.5V8.6l1.7 1.8c.1.1.2.1.4.1s.2-.1.4-.1a1.79 1.79 0 00-.11-.7zM14 7.7v8.2h-2.9v-3.4a.47.47 0 00-.5-.5H6.67a.47.47 0 00-.5.5v3.4H3.38V8.2L9 2.3l5 5.4z"
        fill={props.fill || "#fff"}
      />
    </svg>
  );
};

export default Home;
