import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { css } from "@emotion/core"
import Header from "./header"

const wrapper = css({
  padding: "5% 10%",
})

const Layout = ({ location, title, children }) => {
  return (
    <>
      <Header />
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
