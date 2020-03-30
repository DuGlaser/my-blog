import React from "react"
import { rhythm } from "../utils/typography"
import { Link } from "gatsby"
import { css } from "@emotion/core"

const article = css({
  width: "400px",
  maxWidth: "100%",
  height: "400px",
  boxShadow: "0 0 8px #ccc",
  padding: "1rem",
})

const Article = ({ slug, title, date, description }) => {
  return (
    <article key={slug} css={article}>
      <Link
        style={{ boxShadow: `none`, textDecoration: `none`, color: `#555` }}
        to={slug}
      >
        <header>
          <h3
            style={{
              marginTop: rhythm(1),
              marginBottom: rhythm(1),
            }}
          >
            {title}
          </h3>
          <small
            style={{
              display: "inline-block",
              marginBottom: rhythm(1),
            }}
          >
            {date}
          </small>
        </header>
        <section>
          <p
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        </section>
      </Link>
    </article>
  )
}

export default Article
