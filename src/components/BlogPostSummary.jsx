import dayjs from 'dayjs';
import { graphql, Link, navigate } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { H_ELLIPSIS_ENTITY } from '../constants/entities';
import { getSimilarWords } from '../utilities/search';
import { container, content } from './BlogPostSummary.module.scss';

const BlogPostSummary = ({
  frontmatter: { datePublished, postTitle, seoMetaDescription },
  searchTerm,
  slug,
}) => {
  const containerNode = useRef();
  const titleNode = useRef();

  const [similarWords, setSimilarWords] = useState([]);

  const postLink = () => `/${slug}?s=${searchTerm}`;

  useEffect(() => {
    if (containerNode.current) {
      // deliberately set style with javascript and not CSS for accessibility reasons
      containerNode.current.style.cursor = 'pointer';
    }
    const listener = (event) => {
      if (containerNode.current && !titleNode.current.contains(event.target)) {
        navigate(postLink());
      }
    };
    containerNode.current.addEventListener('mousedown', listener);
    return () => {
      if (containerNode.current) {
        containerNode.current.removeEventListener('mousedown', listener);
      }
    };
  }, [containerNode, titleNode, searchTerm]);

  useEffect(() => {
    setSimilarWords(getSimilarWords(searchTerm, seoMetaDescription));
  }, [searchTerm]);

  const highlightSearchStemCommonWords = (text) => {
    if (similarWords.length > 0) {
      const parts = text.split(new RegExp(`(${similarWords.join('|')})`, 'gi'));
      return (
        <p>
          {parts.map((part) => {
            if (part !== '') {
              if (similarWords.includes(part.toLowerCase())) {
                return <mark key={uuidv4()}>{part}</mark>;
              }
              return <span key={uuidv4()}>{part}</span>;
            }
            return null;
          })}
        </p>
      );
    }
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <p>
        {parts.map((part) => (
          <span key={uuidv4()}>
            {part.toLowerCase() === searchTerm.toLowerCase() ? <mark>{part}</mark> : part}
          </span>
        ))}
      </p>
    );
  };

  const formattedSeoMetaDescription = () => (
    <p>{highlightSearchStemCommonWords(seoMetaDescription)}</p>
  );

  const date = dayjs(datePublished);
  const idString = `blog-post-summary-${slug.slice(0, -1)}`;

  return (
    <div className={container} ref={containerNode}>
      <div className={content}>
        <h3 ref={titleNode}>
          <Link
            aria-label={`Open ${postTitle} blog post`}
            aria-describedby={idString}
            to={postLink()}
          >
            {postTitle}
          </Link>
        </h3>
        <p>{`${date.format('D')} ${date.format('MMM')}`}</p>
        <p>{formattedSeoMetaDescription()}</p>
        <span aria-hidden id={idString}>
          Read more {H_ELLIPSIS_ENTITY}
        </span>
      </div>
    </div>
  );
};

BlogPostSummary.defaultProps = {
  searchTerm: '',
};

BlogPostSummary.propTypes = {
  frontmatter: PropTypes.shape({
    datePublished: PropTypes.string,
    postTitle: PropTypes.string,
    seoMetaDescription: PropTypes.string,
  }).isRequired,
  searchTerm: PropTypes.string,
  slug: PropTypes.string.isRequired,
};

export const query = graphql`
  fragment BlogPostSummaryFragment on Mdx {
    excerpt(pruneLength: 400)
    id
    slug
    frontmatter {
      postTitle
      datePublished(formatString: "YYYY-MM-DDTHH:mm:ssZ")
      seoMetaDescription
    }
  }
`;

export { BlogPostSummary as default };
