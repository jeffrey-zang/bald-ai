import Camera from "./components/Camera";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Bald AI</h1>
      <p className="text-lg mb-8">find out if you&apos;re bald 💪👨‍🦲</p>
      <Camera />
    </div>
  );
}
