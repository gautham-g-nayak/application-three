import styles from "./App.module.css";
import List from "./components/List";
import InputWithLabel from "./components/InputWithLabel";
import logo from "./assets/logo.png";
import usePersistence from "./hooks/usePersistence";
import React, {
  useEffect,
  useReducer,
  useCallback,
  createContext,
  useState,
} from "react";
import axios from "axios";
import { useDebounce } from "./hooks/useDebounce";
import { StateType, ActionType } from "./types";
import InfiniteScroll from "react-infinite-scroll-component";

export const title: string = "React Training";

export function storiesReducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "SET_STORIES":
      return { data: action.payload.data, isError: false, isLoading: false };
    case "INIT_FETCH":
      return { ...state, isLoading: false, isError: false };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, isError: true };
    case "REMOVE_STORY":
      const filteredState = state.data.filter(
        (story: any) => story.objectID !== action.payload.id
      );
      return { data: filteredState, isError: false, isLoading: false };
    default:
      return state;
  }
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

interface AppContextType {
  onClickDelete: (e: number) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App(): JSX.Element {
  const [searchText, setSearchText] = usePersistence("searchTerm", "");
  const debouncedUrl = useDebounce(API_ENDPOINT + searchText);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isError: false,
    isLoading: false,
  });

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(debouncedUrl);
      setTotalPage(response.data.nbPages);
      setCurrentPage(0);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
      setIsLoading(false);
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [debouncedUrl]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  const handleDeleteClick = useCallback((objectId: number) => {
    console.log("Delete click captured", objectId);
    dispatchStories({ type: "REMOVE_STORY", payload: { id: objectId } });
  }, []);

  async function fetchMoreData() {
    setCurrentPage(currentPage + 1);
    try {
      const response = await axios.get(debouncedUrl, {
        params: { page: currentPage + 1 },
      });
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: stories.data.concat(response.data.hits) },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }

  if (stories.isError) {
    return (
      <h1 style={{ marginTop: "10rem", color: " red" }}>
        Something went wrong
      </h1>
    );
  }

  return (
    <div>
      <nav>
        <div className={styles.heading}>
          <h1>{title}</h1>
          <img src={logo} />
        </div>
        <InputWithLabel
          searchText={searchText}
          onChange={handleChange}
          id="searchBox"
        >
          Search
        </InputWithLabel>
      </nav>
      {isLoading ? (
        <h1 style={{ marginTop: "10rem" }}>Loading</h1>
      ) : (
        <div>
          <AppContext.Provider value={{ onClickDelete: handleDeleteClick }}>
            <InfiniteScroll
              dataLength={stories.data.length}
              next={fetchMoreData}
              hasMore={currentPage !== totalPage}
              loader={<h4>Loading...</h4>}
            >
              <List listOfItems={stories.data} />
            </InfiniteScroll>
          </AppContext.Provider>
        </div>
      )}
    </div>
  );
}

export default App;
