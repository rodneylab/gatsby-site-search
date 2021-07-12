const remark = require('remark');
const strip = require('strip-markdown');
const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = async ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'Mdx') {
    const slug = createFilePath({ node, getNode, basePath: 'content/blog' });
    createNodeField({
      name: 'slug',
      node,
      value: slug,
    });
  }
};

exports.onCreatePage = async ({ page, actions, getNodes }) => {
  const { createPage, deletePage } = actions;

  if (page.path.match(/^\/$/)) {
    const postsRemark = await getNodes().filter((value) => value.internal.type === 'Mdx');
    const allPosts = [];
    postsRemark.forEach((element) => {
      let body;
      const { rawBody } = element;
      const bodyStartIndex = rawBody.indexOf('---\n', 4);
      const markdownBody = rawBody.slice(bodyStartIndex);
      remark()
        .use(strip)
        .process(markdownBody, (err, file) => {
          if (err) throw err;
          body = String(file);
        });
      const { categories, featuredImageAlt, postTitle, seoMetaDescription, tags } =
        element.frontmatter;
      const { slug } = element.fields;
      allPosts.push({
        id: element.id,
        body,
        categories,
        featuredImageAlt,
        postTitle,
        seoMetaDescription,
        slug,
        tags,
      });
    });

    deletePage(page);
    createPage({
      ...page,
      context: {
        ...page.context,
        postData: {
          allPosts,
        },
      },
    });
  }
};
