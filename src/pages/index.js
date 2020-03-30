import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import Article from "../components/article"
import { css } from "@emotion/core"

const content = css({
  width: "100%",
  display: "grid",
  gridAutoRows: "1fr",
  gridTemplateColumns: "repeat(auto-fit, minmax(100%, 1fr))",
  justifyContent: "space-between",
  alignItems: "center",
  gridRowGap: "80px",
  gridColumnGap: "40px",
})

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const siteDisc = data.site.siteMetadata.description
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title={siteTitle} description={siteDisc} />
      {/* TODO:CREATE header */}
      {/* <Bio /> */}
      <div css={content}>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          const articleObj = {
            title: title,
            slug: node.fields.slug,
            date: node.frontmatter.date,
            description: node.frontmatter.description,
          }
          return <Article {...articleObj} />
        })}
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
