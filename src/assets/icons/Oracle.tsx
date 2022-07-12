import React from 'react'

const Oracles = (props: any): JSX.Element => {
  return (
    <svg
      width={props.width || 36}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 135"
    >
      <path
        fill={props.fill || '#fff'}
        d="M79.92,18.4C79.1,8.1,70.51,0,60,0S40.9,8.1,40.08,18.4C16.74,26.62,0,48.85,0,75c0,33.14,26.86,60,60,60
	c33.14,0,60-26.86,60-60C120,48.85,103.26,26.62,79.92,18.4z M110,75c0,6.2-1.14,12.14-3.21,17.62L65.67,39.17
	c5.53-1.63,10.05-5.6,12.45-10.76C96.76,35.69,110,53.82,110,75z M41.88,28.41c2.4,5.16,6.92,9.12,12.45,10.76L13.22,92.62
	C11.14,87.14,10,81.2,10,75C10,53.82,23.24,35.69,41.88,28.41z M60,125c-17.43,0-32.79-8.97-41.75-22.53L60,48.2l41.75,54.27
	C92.79,116.03,77.43,125,60,125z"
      />
    </svg>
  )
}

export default Oracles
