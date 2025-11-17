export default function Rooms() {
  return (
    <div className="flex flex-col justify-between p-6 space-y-8 bg-gray-100">
      <div className="flex justify-end">
        {/* Logout button can be added here if needed */}
      </div>
      <h1 className="text-2xl text-purple-900 font-bold mb-4">Rooms</h1>
      <p className="text-gray-500">This is where you can manage rooms.</p>
      {/* Add room management components or forms here */}
      <input
        type="text" 
        placeholder="Name the room here"
        className="border text-slate-700 p-2 w-full mb-4"
      />
      <input
        type="text"
        placeholder="Description of the room"
        className="border text-slate-700 p-2 w-full mb-4"
        />
    </div>
  );
}