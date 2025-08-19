import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const queryEnabled = !!searchQuery;

  const { data, isPending, isError, isSuccess } = useQuery<FetchMoviesResponse>(
    {
      queryKey: ["movies", searchQuery, page],
      queryFn: () => fetchMovies(searchQuery, page),
      enabled: queryEnabled,
      placeholderData: (prev) => prev,
    }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasSearched(true);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };

  useEffect(() => {
    if (isSuccess && data?.results.length === 0 && hasSearched) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data, hasSearched]);

  return (
    <>
      <SearchBar onSubmit={handleSearch} />
      <main>
        {hasSearched && isPending && <Loader />}
        {isError && <ErrorMessage />}

        {isSuccess && data && data.results.length > 0 && (
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
