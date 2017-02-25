import * as React from "react";
import { Link } from 'react-router'
import * as _ from "lodash";

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles';

import {
	/* Core */
	SearchkitManager, SearchkitProvider, SearchkitComponent,

	/* Components - Basic & Navigation */
	SearchBox, Hits, NoHits, HitItemProps, InitialLoader, Pagination, // PaginationSelect,

	/* Components - Display, Sorting & Metadata */
	ViewSwitcherHits, ViewSwitcherToggle, PageSizeSelector, SortingSelector,HitsStats,

	/* Components - UI */
	Layout, LayoutBody, LayoutResults, TopBar, SideBar, ActionBar, ActionBarRow, Panel,

	/* Components - List */
	ItemCheckboxList, CheckboxItemList, ItemHistogramList, Select, // ItemList, Tabs, Toggle, TagCloud,

	/* Components - Range */
	//RangeSliderHistogram, RangeSliderHistogramInput, RangeInput, RangeSlider, RangeHistogram, RangeSliderInput, RangeHistogramInput

	// Query DSL
	//MultiMatchQuery, TermQuery, BoolShould, BoolMust, BoolMustNot, RangeQuery, FilteredQuery, MatchQuery, MatchPhrasePrefix, SimpleQueryString,

	/* Filters */
	RefinementListFilter, ResetFilters, MenuFilter, GroupedSelectedFilters, //SelectedFilters, HierarchicalMenuFilter, HierarchicalRefinementFilter, NumericRefinementListFilter ,CheckboxFilter, DynamicRangeFilter, RangeFilter, InputFilter, TagFilter, TagFilterList, TagFilterConfig
} from "searchkit";

require("./index.scss");

const host = (process.env.ELASTIC_URL || "https://elasticsearch.fccinteractive.com/fccnn")
const searchkit = new SearchkitManager(host, {
	searchOnLoad: true,
	useHistory: true,
  //basicAuth:(process.env.ELASTIC_AUTH || null)
})

searchkit.setQueryProcessor((plainQueryObject) => {
  if (plainQueryObject.filter != undefined) {
    // hot fix for ES5
    plainQueryObject.post_filter = plainQueryObject.filter
    delete plainQueryObject.filter
  }
  return plainQueryObject
})

function refreshMe() {
	// NOTE: This is disabled for now until future implementation
	//searchkit.reloadSearch()
	//console.log('refreshed')
}

const InitialLoaderComponent = (props) => {
	const {bemBlocks} = props
	return (
		<div className={'sk-initial-loader'}>
    Loading, please wait...
		</div>
	)
}

export const ArticleHitsSingleItem = (props)=> {
  const {bemBlocks, result} = props
	let url = "http://" + result._source.url
	let post_date = new Date(result._source.post_date)
	let date = post_date.toDateString()
	let thumb = (result._source.search_thumb == "www.fccnn.com/sites/default/files/styles/16x9_860/public") ? null:result._source.search_thumb
	let img = (thumb == null) ? "https://s3-us-west-2.amazonaws.com/s.cdpn.io/446514/inforum-placeholder.png":"http://" + result._source.images[0]['16x9_860']
	let imgalt = (thumb == null) ? null:result._source.images[0].alt
	let caption = (imgalt == null) ? "":result._source.images[0].alt
	//let name = (result._source.name) ? ", by " + result._source.name:""
	let author = (result._source.author) ? result._source.author:""
	let authorname = (author.realname) ? "By " + author.realname + ", ":name
	let linkstyle = "text-decoration:none;";
	//let body = result._source.body
	//let bodyval = (body.safe_value !== "") ? body.safe_value:body.value.replace(/(<([^>]+)>)/ig,"")
	//let excerpt = bodyval.substr(0, 252)+'&hellip;' // add check to make sure substr is not null
	//http://www.fccnn.com/sites/all/themes/duluthnewstribune_theme/images/logo-retina.png
	let category = (result._source.category[0]['name']) ? "| " + result._source.category[0]['name']:""
  const source:any = _.extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
			<h1 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></h1>
			<h3 className={bemBlocks.item("subtitle")}>{authorname}{date} | <a href={url} className={bemBlocks.item("link")} target="_blank">{source.newspaper}</a></h3>
      <div className={bemBlocks.item("poster")}>
        <img data-qa="poster" src={img}/>
				<h3 className={bemBlocks.item("caption")}>{caption}</h3>
      </div>
      <div className={bemBlocks.item("details")}>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.body.value}}></div>
				<hr></hr>
				<strong>Explore related topics:</strong>
				<div className={bemBlocks.item("category")} dangerouslySetInnerHTML={{__html:source.category[0]['name']}}></div>
      </div>
    </div>
  )
}

export class ArticlePage extends React.Component {
	render(){
		let refresh = setInterval(refreshMe, 60000)
		return (
			<SearchkitProvider searchkit={searchkit}>
		    <Layout>
		      <TopBar>
						<div className="fcc-logo"><Link to="search"><img data-qa="fcc-ico" className="fcc-menu-logo" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/446514/Inforum_Logo_2016_searchkit-2.png" width="166" height="40"/></Link></div>
		        <SearchBox
		          autofocus={true}
		          searchOnChange={true}
							placeholder="Search content..."
		          prefixQueryFields={["title^2", "body.value", "author.realname", "category.categories.name", "tags.name", "address"]}/>
		      </TopBar>
		      <LayoutBody>
		        <SideBar>
							<MenuFilter
								id="select-newspaper"
								title="Newspaper"
								field="newspaper.raw"
								operator="AND"
								size={9999}
								listComponent={Select} />
							<MenuFilter
								id="select-author"
								title="Author"
								field="author.realname.raw"
								operator="AND"
								size={9999}
								listComponent={Select} />
							<RefinementListFilter
		            id="category"
		            title="Category"
		            field="category.name.raw"
		            operator="AND"
								listComponent={CheckboxItemList}
		            size={6}
								containerComponent={<Panel collapsable={true} defaultCollapsed={false}/>} />
							<RefinementListFilter
		            id="tags"
		            title="Tag"
		            field="tags.name.raw"
		            operator="AND"
		            size={6}
								containerComponent={<Panel collapsable={true} defaultCollapsed={false}/>} />
							<MenuFilter
								id="select-state"
								title="State"
								field="address.state.raw"
								operator="AND"
								size={9999}
								listComponent={Select} />
							<MenuFilter
								id="select-city"
								title="City"
								field="address.city.raw"
								operator="AND"
								size={9999}
								listComponent={Select} />
							<MenuFilter
								id="type"
								title="Content Type"
								field="type.raw"
								listComponent={ItemHistogramList}
								containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>} />
		        </SideBar>
		        <LayoutResults>

		          <ActionBar>
		            <ActionBarRow>
		              <HitsStats/>
									<ViewSwitcherToggle/>
									<PageSizeSelector options={[1, 5, 10, 16, 24]} listComponent={Select}/>
									<SortingSelector options={[
										{label:"Newest", field:"created", order:"desc", defaultOption:true},
										{label:"Relevance", field:"_score", order:"desc"},
										{label:"Oldest", field:"created", order:"asc"}
									]}/>
		            </ActionBarRow>

		            <ActionBarRow>
		              <GroupedSelectedFilters/>
		              <ResetFilters/>
		            </ActionBarRow>
		          </ActionBar>

							<ViewSwitcherHits
								hitsPerPage={1}
								sourceFilter={["nid","type","post_date","title","excerpt","body","author","newspaper","url","search_thumb", "thumb_filename","category","tags", "images"]}
								hitComponents = {[
									{key:"article", title:"Article", itemComponent:ArticleHitsSingleItem, defaultOption:true}
								]}
								scrollTo="body"
								/>
							<InitialLoader component={InitialLoaderComponent}/>
		          <NoHits/>
		        </LayoutResults>
		      </LayoutBody>
		    </Layout>
		  </SearchkitProvider>
		)
	}
}
