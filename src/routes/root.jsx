import { Outlet, Link } from "react-router-dom";
import constants from "./constants";
export default function Root() {
  console.log(constants.VERSION);
  return (
    <>
      <div id="sidebar">
        <h2> {constants.APP_NAME}</h2>
        <h1> Version: {constants.VERSION}</h1>
        <div>
          <form id="search-form" role="search">
            {/* <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            /> */}
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          {/* <form method="post">
            <button type="submit">New</button>
          </form> */}
        </div>
        <nav>
          <ul>
            <li>
              <Link to={`askQuestions`}>Ask Question</Link>
            </li>
            <li>
              <Link to={`findAnswers`}>Questions</Link>
            </li>
            <li>
              <Link to={`contacts`}>Tags</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
