import { useFetch } from "../hooks/useFetch";
import { SocketContextProvider, useSocketContext } from "../providers/SocketProvider";
import { useEffect, useState } from "react";

interface Data {
  field1: string;
  field2: string;
  field3: string;
  field4: string;
}

const SocketPage = () => {
  return (
    <SocketContextProvider serverUrl="http://localhost:4000">
      <SocketPageContent />
    </SocketContextProvider>
  );
};

const SocketPageContent = () => {
  const socket = useSocketContext();
  const { data: fetchedData, isLoading, error } = useFetch({
    baseUrl: "http://localhost:4000",
    endpoint: "/api/socket/data",
    method: "GET",
    json: true,
  });

  const [data, setData] = useState<Data>({
    field1: "",
    field2: "",
    field3: "",
    field4: "",
  });

  useEffect(() => {
    if (fetchedData && Object.keys(fetchedData).length > 0) {
      setData(fetchedData as Data);
    }
  }, [fetchedData]);

  const handleUpdate = () => {
    if (socket) {
      socket.emit("updateData", data);
    }
  };

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-zinc-100 p-10">
      <h1 className="text-3xl font-bold text-zinc-900">Real-Time Dashboard</h1>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="p-3 rounded-lg">
            <h2 className="text-zinc-900">{key}</h2>
            <input
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-2 p-2 w-full border border-zinc-300 rounded-md"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleUpdate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
      >
        Update Data
      </button>
    </div>
  );
};

export default SocketPage;
