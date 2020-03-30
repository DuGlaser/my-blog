import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { css } from "@emotion/core"
import Header from "./header"

const wrapper = css({
  padding: "5%",
})

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <>
      <Header>{header}</Header>
      <div css={wrapper}>
        <main>{children}</main>
        <footer>
          <small>© {new Date().getFullYear()}.damegane</small>
        </footer>
      </div>
    </>
  )
}

export default Layout
