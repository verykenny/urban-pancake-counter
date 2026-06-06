export default function GamePage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-3xl font-bold">Game {params.id}</h1>
      <p className="text-gray-500">Score board coming soon.</p>
    </main>
  );
}
