export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Lorcana Score Tracker</h1>
      <p className="text-gray-500">Enter a game code to join or start a session.</p>
      <form action="/game/placeholder" className="flex gap-3">
        <input
          type="text"
          name="code"
          placeholder="Game code"
          className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Join
        </button>
      </form>
    </main>
  );
}
