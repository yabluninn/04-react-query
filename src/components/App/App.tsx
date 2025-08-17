import { useState, useEffect } from "react";
import { useQuery, type QueryFunction } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import ReactPaginate from "react-paginate";
import {
  fetchMovies,
  type FetchMoviesResponse,
} from "../../services/movieService";
import type { Movie } from "../../types/movie";
import css from "./App.module.css";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const queryKey = ["movies", searchQuery, page];

  const queryFn: QueryFunction<FetchMoviesResponse> = () => {
    return fetchMovies(searchQuery, page);
  };

  const {
    data,
    isError,
    isPending, // ⚠️ з версії 5 замість isLoading
  } = useQuery({
    queryKey,
    queryFn,
    enabled: !!searchQuery,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasSearched(true);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };

  useEffect(() => {
    if (!isPending && !isError && data && data.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isPending, isError, data]);

  return (
    <>
      <SearchBar onSubmit={handleSearch} />
      <main>
        {hasSearched && isPending && <Loader />}
        {isError && <ErrorMessage />}

        {!isPending && !isError && data?.results.length > 0 && (
          <>
            {data.total_pages > 1 && (
              <ReactPaginate
                pageCount={data.total_pages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                onPageChange={handlePageChange}
                forcePage={page - 1}
                containerClassName={css.pagination}
                activeClassName={css.active}
                nextLabel="→"
                previousLabel="←"
              />
            )}
            <MovieGrid movies={data.results} onSelect={setSelectedMovie} />
          </>
        )}

        {selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </main>
      <Toaster position="top-right" />
    </>
  );
}
