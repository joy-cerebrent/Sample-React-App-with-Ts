import { useEffect, useState } from "react";
// import { useFetch } from "../hooks/useFetch";
import { useFetch } from "../../../utility-package/dist";
// import { useDebounce } from "../hooks/useDebounce";
import { useDebounce } from "../../../utility-package/dist";

const SearchPage = () => {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce<string>({ value: query, delay: 500 });
  const [results, setResults] = useState<Array<string> | undefined>();

  const { data, isLoading } = useFetch({
    baseUrl: "http://localhost:4000",
    endpoint: "/api/movie/filter",
    method: "GET",
    query: { title: debouncedQuery },
    json: true,
    abortController: true,
    experimentalCaching: true,
  });

  useEffect(() => {
    if (data) {
      setResults(data as string[]);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 space-y-6 bg-zinc-100">
      <h1 className="text-3xl font-bold text-zinc-900">Search Movies</h1>

      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleChange}
        className="mt-4 p-2 rounded-md border border-zinc-300"
      />
      {!query && <p>No search param</p>}

      {isLoading && <p>Loading...</p>}

      {results && results.length === 0 && <p>No movies found matching your query.</p>}

      {results && results.length > 0 && (
        <div className="w-full max-w-md">
          <ul>
            {results.map((movie, index) => (
              <li key={index} className="text-lg py-1">
                {movie}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
