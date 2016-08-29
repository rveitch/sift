import * as React from "react";
import * as _ from "lodash";

import {
	SearchkitManager, SearchkitProvider,
	SearchBox, RefinementListFilter, MenuFilter,
	Hits, HitsStats, NoHits, Pagination, SortingSelector,
	SelectedFilters, ResetFilters, ItemHistogramList,
	Layout, LayoutBody, LayoutResults, TopBar,
	SideBar, ActionBar, ActionBarRow, RangeFilter, ViewSwitcherToggle,
  ViewSwitcherHits, MultiMatchQuery, SearchkitComponent
} from "searchkit";

require("./index.scss");

const host = "https://3590b9d403c87e0697b6:8c2e5209a1@f08f4b1b.qb0x.com:30242/fccnn"
const searchkit = new SearchkitManager(host, {
	searchOnLoad: true,
	useHistory: false,
  basicAuth:"3590b9d403c87e0697b6:8c2e5209a1"
})

//var myVar = setInterval(searchkit.reloadSearch(), 1000)

//setInterval searchkit.reloadSearch()

/*searchkit.addDefaultQuery((query)=> {
    return query.addQuery(FilteredQuery({
      filter:BoolShould([
        TermQuery("status", "1"),
      ])
    }))
  })*/
//var Hits = Searchkit.Hits;
//http://docs.searchkit.co/stable/docs/setup/default-query.html

//source.author[0].realname
function refreshMe() {
	//searchkit.reloadSearch()
	//console.log('refreshed')
}

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props
	let url = "http://" + result._source.url
	let post_date = new Date(result._source.post_date)
	let date = post_date.toDateString()
	let thumb = (result._source.search_thumb == "www.fccnn.com/sites/default/files/styles/square_300/public") ? null:result._source.search_thumb
	let img = (thumb == null) ? "http://www.inforum.com/sites/all/themes/inforum_theme/images/touch-icon.png":"http://" + result._source.search_thumb
  const source:any = _.extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" className={bemBlocks.item("poster")} src={img} />
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}>
        </div>
      </a>
    </div>
  )
}

export const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props
	let url = "http://" + result._source.url
	let post_date = new Date(result._source.post_date)
	let date = post_date.toDateString()
	let thumb = (result._source.search_thumb == "www.fccnn.com/sites/default/files/styles/square_300/public") ? null:result._source.search_thumb
	let img = (thumb == null) ? "http://www.inforum.com/sites/all/themes/inforum_theme/images/touch-icon.png":"http://" + result._source.search_thumb
	let name = (result._source.name) ? ", by " + result._source.name:""
	let author = (result._source.author) ? result._source.author:""
	let authorname = (author.realname) ? ", by " + author.realname:name
	let body = result._source.body
	let bodyval = (body.safe_value !== "") ? body.safe_value:body.value.replace(/(<([^>]+)>)/ig,"")
	let exerpt = bodyval.substr(0, 252)+'&hellip;'
	let category = (result._source.category[0]['name']) ? "| " + result._source.category[0]['name']:""
  const source:any = _.extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img data-qa="poster" src={img}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>{date}{authorname} | {source.newspaper} {category}</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:exerpt}}></div>
      </div>
    </div>
  )
}

export class SearchPage extends React.Component {
	render(){
		let refresh = setInterval(refreshMe, 60000)
		return (
			<SearchkitProvider searchkit={searchkit}>
		    <Layout>
		      <TopBar>
						<div className="fcc-logo"><img data-qa="fcc-ico" className="fcc-menu-logo" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/446514/Inforum_Logo_2016_searchkit-2.png" width="166" height="40"/></div>
		        <SearchBox
		          autofocus={true}
		          searchOnChange={true}
							placeholder="Search content..."
		          prefixQueryFields={["title^2", "body.value", "author.realname", "category.categories.name", "tags.name"]}/>
		      </TopBar>
		      <LayoutBody>
		        <SideBar>
							<MenuFilter
								id="type"
								title="Content Type"
								field="type.raw"
								listComponent={ItemHistogramList}/>
		          <RefinementListFilter
		            id="newspaper"
		            title="Newspaper"
		            field="newspaper.raw"
		            operator="AND"
		            size={6}/>
							<RefinementListFilter
		            id="category"
		            title="Category"
		            field="category.name"
		            operator="AND"
		            size={6}/>
							<RefinementListFilter
								id="author"
								title="Author"
								field="author.realname.raw"
								operator="AND"
								size={6}/>
		        </SideBar>
		        <LayoutResults>

		          <ActionBar>
		            <ActionBarRow>
		              <HitsStats/>
									<ViewSwitcherToggle/>
									<SortingSelector options={[
										{label:"Newest", field:"created", order:"desc", defaultOption:true},
										{label:"Relevance", field:"_score", order:"desc"},
										{label:"Oldest", field:"created", order:"asc"}
									]}/>
		            </ActionBarRow>

		            <ActionBarRow>
		              <SelectedFilters/>
		              <ResetFilters/>
		            </ActionBarRow>
		          </ActionBar>

							<ViewSwitcherHits
								hitsPerPage={16}
								sourceFilter={["title", "search_thumb", "url", "nid", "post_date", "author", "name", "newspaper", "body", "category"]}
								hitComponents = {[
									{key:"grid", title:"Grid", itemComponent:MovieHitsGridItem, defaultOption:true},
									{key:"list", title:"List", itemComponent:MovieHitsListItem}
								]}
								scrollTo="body"
								/>
		          <NoHits/>
							<Pagination showNumbers={true}/>
		        </LayoutResults>
		      </LayoutBody>
		    </Layout>
		  </SearchkitProvider>
		)
	}
}
