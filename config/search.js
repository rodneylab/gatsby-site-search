const searchOptions = {
  indexStrategy: 'Prefix match',
  searchSanitiser: 'Lower Case',
  indexBy: ['body', 'categories', 'featuredImageAlt', 'postTitle', 'seoMetaDescription', 'tags'],
  termFrequency: true,
  removeStopWords: true,
  stemWords: true,
};

export { searchOptions as default };
