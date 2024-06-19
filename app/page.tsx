export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="font-bold text-4xl">This project has been retired.</h1>
      <h2 className="font-semibold text-2xl">
        You can find the source code here:
      </h2>
      <a
        className="text-sky-500 underline"
        href="https://github.com/ethanmick/time-tracker"
      >
        Code
      </a>
      <p className="text-lg">Thank you,</p>
      <p className="text-lg italic">Ethan</p>
    </main>
  )
}
