import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { css } from "@emotion/core"
import Header from "./header"

const flex = css({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
})

const wrapper = css({
  width: "100%",
  padding: "5% 10%",
})

const footer = css({
  marginTop: "auto",
  width: "100%",
  height: "40px",
  textAlign: "center",
  color: "#bbb",
})

const Layout = ({ location, title, children }) => {
  return (
    <div css={flex}>
      <Header />
      <div css={wrapper}>
        <main>{children}</main>
      </div>
      <footer css={footer}>
        <small>© {new Date().getFullYear()}.damegane</small>
      </footer>
    </div>
  )
}

export default Layout
