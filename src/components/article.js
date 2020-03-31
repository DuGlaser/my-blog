import React from "react"
import { rhythm } from "../utils/typography"
import { Link } from "gatsby"
import { css } from "@emotion/core"

const article = css({
  width: "400px",
  maxWidth: "100%",
  height: "400px",
  boxShadow: "0 0 8px #ccc",
  margin: "0 auto",
})

const Article = ({ slug, title, date, description, thumbnail }) => {
  return (
    <article key={slug} css={article}>
      <Link
        style={{ boxShadow: `none`, textDecoration: `none`, color: `#555` }}
        to={slug}
      >
        <header>
          <img css={{ margin: 0 }} src={thumbnail} />
          <h3
            style={{
              padding: "0 1rem",
              marginTop: rhythm(1),
              marginBottom: rhythm(1),
            }}
          >
            {title}
          </h3>
          <small
            style={{
              padding: "0 1rem",
              display: "inline-block",
              marginBottom: rhythm(1),
            }}
          >
            {date}
          </small>
        </header>
        <section>
          <p
            style={{
              padding: "0 1rem",
            }}
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
