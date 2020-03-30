import React from "react"
import { Link } from "gatsby"
import { css, jsx } from "@emotion/core"

const header = css({
  padding: "0 5%",
  width: "100%",
  height: "80px",
  backgroundColor: "#D75569",
  display: "flex",
  alignItems: "center",
})

const title = css({
  color: "#fff",
  margin: 0,
  textDecoration: "none",
})

const Header = () => {
  return (
    <header css={header}>
      <Link to={"/"} style={{ boxShadow: `none`, color: `inherit` }}>
        <h1 css={title}>dame blog</h1>
      </Link>
    </header>
  )
}

export default Header
