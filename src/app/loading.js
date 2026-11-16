export default function Loading() {
  return (
    <div className='fixed top-0 start-0 w-full h-0.5 overflow-hidden z-50'>
      <div className='animate-progress w-full h-full bg-orange-500 origin-start-right shadow-md'></div>
    </div>
  );
}
