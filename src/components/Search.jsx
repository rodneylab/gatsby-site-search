import { navigate } from 'gatsby';
import {
  AllSubstringsIndexStrategy,
  CaseSensitiveSanitizer,
  ExactWordIndexStrategy,
  LowerCaseSanitizer,
  PrefixIndexStrategy,
  Search as JSSearch,
  StemmingTokenizer,
  StopWordsTokenizer,
  TfIdfSearchIndex,
  UnorderedSearchIndex,
} from 'js-search';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { stemmer } from 'stemmer';
import searchOptions from '../../config/search';
import { H_ELLIPSIS_ENTITY } from '../constants/entities';
import { isBrowser } from '../utilities/utilities';
import BlogPostSummary from './BlogPostSummary';
import { SearchIcon } from './Icons';
import {
  searchButton,
  searchInput,
  searchInputContainer,
  searchLabel,
  searchNoResultsText,
  searchTextInput,
} from './Search.module.scss';

const Search = ({ data, posts }) => {
  const {
    termFrequency = true,
    removeStopWords = true,
    stemWords = true,
    indexStrategy = 'Prefix match',
    searchSanitiser = 'Lower case',
    indexBy = ['body', 'postTitle'],
  } = searchOptions;

  let searchParam;
  if (isBrowser) {
    const params = new URLSearchParams(window.location.search.substring(1));
    searchParam = params.get('s') || '';
  }

  const [isLoading, setLoading] = useState(true);
  const [search, setSearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputNode = useRef();

  const addSearchIndices = (dataToSearch) => {
    indexBy.forEach((element) => {
      dataToSearch.addIndex(element);
    });
  };

  const getPostNode = (postID) => {
    const { edges } = data.allMdx;
    return edges.find((value) => value.node.id === postID).node;
  };

  const getPostFrontmatter = (postData) => {
    const { datePublished, featuredImageAlt, tags, seoMetaDescription, thumbnail, wideThumbnail } =
      getPostNode(postData.id).frontmatter;
    const { postTitle } = postData;
    return {
      datePublished,
      featuredImageAlt,
      thumbnail,
      wideThumbnail,
      postTitle,
      seoMetaDescription,
      tags,
    };
  };

  const rebuildIndex = () => {
    const dataToSearch = new JSSearch('id');

    if (removeStopWords) {
      dataToSearch.tokenizer = new StopWordsTokenizer(dataToSearch.tokenizer);
    }
    if (stemWords) {
      dataToSearch.tokenizer = new StemmingTokenizer(stemmer, dataToSearch.tokenizer);
    }
    if (indexStrategy === 'All') {
      dataToSearch.indexStrategy = new AllSubstringsIndexStrategy();
    } else if (indexStrategy === 'Exact match') {
      dataToSearch.indexStrategy = new ExactWordIndexStrategy();
    } else if (indexStrategy === 'Prefix match') {
      dataToSearch.indexStrategy = new PrefixIndexStrategy();
    }

    dataToSearch.sanitizer =
      searchSanitiser === 'Case sensitive'
        ? new CaseSensitiveSanitizer()
        : new LowerCaseSanitizer();
    dataToSearch.searchIndex =
      termFrequency === true ? new TfIdfSearchIndex('id') : new UnorderedSearchIndex();

    addSearchIndices(dataToSearch);
    dataToSearch.addDocuments(posts);
    setSearch(dataToSearch);
    setLoading(false);
  };

  // build the search index when the component mounts
  useEffect(() => {
    rebuildIndex();
  }, []);

  // once the index is built, if we are already waiting for a search result, search and update UI
  useEffect(() => {
    if (searchInputNode.current) {
      searchInputNode.current.focus();
    }
    if (search !== null && searchQuery !== '') {
      const queryResult = search.search(searchQuery);
      setSearchResults(queryResult);
    }
  }, [search]);

  const handleChange = (event) => {
    const queryResult = search.search(event.target.value);
    setSearchQuery(event.target.value);
    setSearchResults(queryResult);
    navigate(`/?s=${event.target.value}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const queryResults = searchQuery === '' ? posts : searchResults;

  if (isLoading || search === null) {
    return <p>Searching{H_ELLIPSIS_ENTITY}</p>;
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="Search">
          <div className={searchInputContainer}>
            <div className={searchInput}>
              <span className={searchLabel}>Search for</span>
              <input
                aria-label="Search blog posts"
                ref={searchInputNode}
                className={searchTextInput}
                autoComplete="off"
                spellCheck={false}
                id="Search"
                value={searchQuery}
                onChange={handleChange}
                placeholder="Search"
                type="search"
              />
              <button aria-labelledby="Search" type="submit" className={searchButton}>
                <SearchIcon />
              </button>
            </div>
          </div>
        </label>
      </form>
      {searchQuery === '' ? null : (
        <>
          {searchResults.length ? (
            <>
              <h1>{`Search results (${searchResults.length})`}:</h1>
              <section role="feed">
                {queryResults.map((value, index) => {
                  const { id } = value;
                  const frontmatter = getPostFrontmatter(value);
                  return (
                    <article aria-posinset={index} aria-setsize="-1" key={id}>
                      <BlogPostSummary frontmatter={frontmatter} slug={value.slug.slice(1)} />
                    </article>
                  );
                })}
              </section>
            </>
          ) : (
            <p className={searchNoResultsText}>
              Nothing like that here! Why don&apos;t you try another search term?
            </p>
          )}
        </>
      )}
    </>
  );
};

Search.propTypes = {
  data: PropTypes.shape({
    allMdx: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            id: PropTypes.string.isRequired,
            frontmatter: PropTypes.shape({
              datePublished: PropTypes.string.isRequired,
            }),
          }),
        }),
      ),
    }),
  }).isRequired,

  posts: PropTypes.arrayOf(
    PropTypes.shape({
      catergories: PropTypes.arrayOf(PropTypes.string),
      featuredImageAlt: PropTypes.string,
      postTitle: PropTypes.string,
      seoMetaDescription: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
};

export { Search as default };
