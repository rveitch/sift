import * as React from "react";
import * as ReactDOM from "react-dom";
import {SearchPage} from "./SearchPage";
import {ArticlePage} from "./ArticlePage";
import {App} from "./AppPage";
import { Router, Link, Route, browserHistory, IndexRoute } from 'react-router'

const Home = () => {
  return (
		<div>
	    <div>
	      <Link to="search">Go to Search</Link>
	    </div>
			<div>
				<Link to="page">Go to Page View</Link>
	    </div>
		</div>
  )
}

const PageView = () => {
	return (
		<div>
			<p>I'm a page view for future implementation.</p>
		</div>
      )
}

ReactDOM.render((
<Router history={browserHistory}>
  <Route path="/" component={App}>
    <IndexRoute component={SearchPage}/>
    <Route path="search" component={SearchPage}/>
		<Route path="article" component={ArticlePage}/>
		<Route path="page" component={PageView} />
  </Route>
</Router>
), document.getElementById('root'));
