export default function Loading() {
  return (
    <div className='fixed top-0 left-0 w-full h-0.5 overflow-hidden'>
      <div className='animate-progress w-full h-full bg-orange-500 origin-left-right shadow-md'></div>
    </div>
  );
}
