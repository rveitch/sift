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

const host = (process.env.ELASTIC_URL || "http://fccpublicsearch.herokuapp.com/fccnn")
const searchkit = new SearchkitManager(host, {
	searchOnLoad: true,
	useHistory: true,
  basicAuth:(process.env.ELASTIC_AUTH || null)
})

function refreshMe() {
	// NOTE: This is disabled for now until future implementation
	//searchkit.reloadSearch()
	//console.log('refreshed')
}

function JSONHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 3);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

const InitialLoaderComponent = (props) => {
	const {bemBlocks} = props
	return (
		<div className={'sk-initial-loader'}>
    Loading, please wait...
		</div>
	)
}

const ArticleHitsGridItem = (props)=> {
  const {bemBlocks, result} = props
	let url = "http://" + result._source.url
	let post_date = new Date(result._source.post_date)
	let date = post_date.toDateString()
	let thumb = (result._source.search_thumb == "www.fccnn.com/sites/default/files/styles/square_300/public") ? null:result._source.search_thumb
	let img = (thumb == null) ? "https://s3-us-west-2.amazonaws.com/s.cdpn.io/446514/inforum-placeholder.png":"http://" + result._source.search_thumb
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

export const ArticleHitsListItem = (props)=> {
  const {bemBlocks, result} = props
	let url = "http://" + result._source.url
	let post_date = new Date(result._source.post_date.replace(/-/g, '/'))
	let date = post_date.toDateString()
	let thumb = (result._source.search_thumb == "www.fccnn.com/sites/default/files/styles/square_300/public") ? null:result._source.search_thumb
	let img = (thumb == null) ? "https://s3-us-west-2.amazonaws.com/s.cdpn.io/446514/inforum-placeholder.png":"http://" + result._source.search_thumb
	let author = (result._source.author) ? result._source.author:""
	let authorname = (author.realname) ? ", by " + author.realname:name
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
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.excerpt}}></div>
      </div>
    </div>
  )
}

const ArticleHitsResponseItem = (props)=> {
  const {bemBlocks, result} = props
  const source:any = _.extend({}, result._source, result.highlight)
	let resultsObj = source
	// remove specific fields from the results before display
	delete resultsObj.newspaper;
	delete resultsObj.author;
	delete resultsObj.type;
	delete resultsObj.tags;
	delete resultsObj.category;
	delete resultsObj.search_thumb;
	delete resultsObj.excerpt;
	let jsonstr = JSON.stringify(resultsObj, undefined, 3)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
			<div className={bemBlocks.item("details")}>
				<SyntaxHighlighter language='json' style={docco}>{jsonstr}</SyntaxHighlighter>
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
								hitsPerPage={10}
								sourceFilter={["nid","type","post_date","title","excerpt","author","newspaper","url","search_thumb","category","tags","location","address"]}
								hitComponents = {[
									{key:"grid", title:"Grid", itemComponent:ArticleHitsGridItem, defaultOption:true},
									{key:"list", title:"List", itemComponent:ArticleHitsListItem},
									{key:"response", title:"Response", itemComponent:ArticleHitsResponseItem}
								]}
								scrollTo="body"
								/>
							<InitialLoader component={InitialLoaderComponent}/>
		          <NoHits/>
							<Pagination showNumbers={true}/>
		        </LayoutResults>
		      </LayoutBody>
		    </Layout>
		  </SearchkitProvider>
		)
	}
}
