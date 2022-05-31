<script context="module">
	export async function preload({ params }) {
		try {
			// let gigFetch = await this.fetch('/index.json');
			// let gigJSON = await gigFetch.json();

			let tOut = [];
			
			// let randomness = moment().unix();

			// for (var tt of gigJSON) {
			// 	tOut.push({...tt, randomness})
			// }

			return {
				gigJSON: tOut
			}
		} catch(ex) {
			console.error(ex);
		}
	}
</script>

<script>
import { onMount } from 'svelte';


	import {
		Jumbotron,
		Row, 
		Col,
		Button, Badge, Icon, ButtonGroup,
		Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Alert,
		Card, CardHeader, CardBody, Popover, Dropdown, DropdownToggle, DropdownMenu, DropdownItem

	} from 'sveltestrap/src';

	import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faRetweet, faCoins, faExternalLinkAlt
	} from '@fortawesome/free-solid-svg-icons';

	import MiniSearch from 'minisearch'

	import {goto} from "@sapper/app"
	import { cloutXRate, toggleDetail, userStore, loginDone, theUsernameObject } from "../commonStore.js"

	import Toggle from '../components/Toggle.svelte';
	import LoadingBlinker from "../components/LoadingBlinker.svelte";
	import DisplayPostVideo from "../components/DisplayPostVideo.svelte";
	import FeedRow from "../components/FeedRow.svelte";

	import moment from 'moment';


	export let tUser = null;

	export let isStarted = false;
	export let isAuthLoaded = false;


	export let bitCloutToUSD = 0;

	cloutXRate.subscribe(xRate => {
		bitCloutToUSD = xRate.bitCloutToUSD;
	});

	userStore.subscribe(u => {
		if (u !== null) {
			tUser = u;
		}
	});

	loginDone.subscribe(l => isAuthLoaded = l);


	

	export let aAuth = function() {
		return new Promise((resolve, reject) => {
			let tI = setInterval(() => {
				if (isAuthLoaded == true) {
					clearInterval(tI);
					if (tUser !== null) {
						let hasKey = typeof tUser["publicKey"] == 'string' ? true : false;
						 resolve(hasKey);
					} else {
						resolve(false);
					}
					
				}
			}, 500)
		});
	}

	let awaitAuth = aAuth();

	
	export let gigJSON = [];

	// export let someRandomness = moment().unix();

	export let usernameObject = {};


	let populateUsernameObject = async function() {
		for (var gig of theGigs) {
			if (typeof (gig.AllowedUsers) !== 'undefined') {
				if (Array.isArray(gig.AllowedUsers)) {
					if (gig.AllowedUsers.length > 0) {
						console.log(gig.AllowedUsers);
						for (var tU of gig.AllowedUsers) {
							// console.log(tU);
							if (typeof (usernameObject[tU] == 'undefined')) {
								try {
									let getUser = await fetch(`/bitclout/user/${tU}/get.node.json`);
									let ttU = await getUser.json();
									let {Username = null} = ttU;
									if (Username !== null) {
										usernameObject[tU] = Username;
									} else {
										console.log(tU);
									}
									// console.log(ttU);
								} catch (ex) {
									console.error(ex);
								} finally {
									console.dir(usernameObject);
									theUsernameObject.set(usernameObject);
								}
							}
						}
					}
				}
			}
		}
	}



	let originalGigs = [];
	let getGigs = async function() {
		try {
			let configObject = {};
			if (tUser !== null) {
				configObject.headers = { Authorization: `Bearer ${tUser.cc.jwt}` }
			}

			let getAllGigs = await fetch("/api/promotion/get/all/Active.json", configObject);
			let allGigsJSON = await getAllGigs.json();
			theGigs = allGigsJSON;
			originalGigs = allGigsJSON;
			populateUsernameObject();
			return true;
		} catch (ex) {
			console.error(ex);
			theGigs = [];
			return false;
		}
		
	}


	let initInterval = setInterval(() => {
		if (isStarted == true) {
			const uParams = new URLSearchParams(window.location.search);

			let hasId = uParams.get("id");
			// console.dir(hasId);
			if (!!hasId) {
				let foundItem = null;
				for (var gg of theGigs) {
					if (parseInt(gg.Id) == parseInt(hasId)) {
						foundItem = gg;
					}
				}
				if (foundItem) {
					clearInterval(initInterval);
					detailToggle(foundItem);
				} else {
					clearInterval(initInterval);
					window.history.replaceState({}, "", window.location.pathname);
				} 
			} else {
				clearInterval(initInterval);
			}
		}	
	},500);


	export let minisearch;

	export const initializeSearch = async function() {
		minisearch = new MiniSearch({
			fields: ["BitcloutUsername", "gigPost"],
			storeFields: Object.keys(gigJSON[0]),
			idField: 'Id',
			searchOptions: {
				boost: {
					BitcloutUsername : 2,
					gigPost: 2
				}
			}
		});
		minisearch.addAll(gigJSON);

	}


	
	export let mainSearch = '';
	export let searchState = '';

	let theGigs = [
		...gigJSON
	];


	export const runGigs = function() {
		return new Promise((resolve, reject) => {
			let tInterval = setInterval(() => {
				if (isStarted == true) {
					// console.log(theGigs);
					clearInterval(tInterval);
					console.log(theGigs);
					resolve(theGigs);
				}
			}, 500);
		});
	}
	let doGigs = runGigs(); 

	

	export let selectedSort = "Highest Payout";

	export let selectedFilter = "None";


	let doSort = async function(ev) {
		let sortType = ev.target.value || null;
		
		if (sortType == 'default') {
			selectedSort = "Newest"
			theGigs.sort((a,b) => a.Id < b.Id ? 1 : -1);
			doGigs = runGigs();
		} else if (sortType == 'highest') {
			selectedSort = "Highest Payout";
			theGigs.sort((a,b) => a.Rate < b.Rate ? 1 : -1);
			doGigs = runGigs();
		} else if (sortType == 'lowest') {
			selectedSort = "Lowest Payout";
			theGigs.sort((a,b) => a.Rate > b.Rate ? 1 : -1);
			doGigs = runGigs();
		}
	}
	let doFilter = async function(ev) {
		let filterType = ev.target.value || null;
		selectedFilter = filterType;
		// console.dir([theGigs, selectedFilter]);
		let outSort = {
				target: { value: "default"}
			}
			if (selectedSort == 'Highest Payout') {
				outSort.target.value = "highest"
			} else if (selectedSort == 'Lowest Payout') {
				outSort.target.value = "lowest"
			} 
		if (selectedFilter == "None") {
			theGigs = originalGigs;
			doSort(outSort);

		} else if (selectedFilter == "For Me") {
			// console.log("for me");
			let newGigs = [];
			if (tUser !== null) {
				for (var gig of originalGigs) {
					let {AllowedUsers = [], MinCoinPriceNanos, MinFollowerCount} = gig;
					
					if (AllowedUsers.length > 0) {
						// console.log('allowed');
						for (var uu of AllowedUsers) {
							if (uu == tUser.publicKey) {
								newGigs.push(gig);
								break;
							}
						}
					} else {
						// user min coin price
						if (tUser.cc.Profile.followerCount >= MinFollowerCount && tUser.cc.Profile.CoinPriceBitCloutNanos  >= MinCoinPriceNanos) {
							let alreadyDone = false;
							if (Array.isArray(gig.events)) {
								for (var event of gig.events) {
									if (event.action == 'UserDidPromotion') {
										if (event.user.publicKey == tUser.publicKey) {
											alreadyDone = true;
										}
									}
								}
							}
							
							if (alreadyDone == false) {
								newGigs.push(gig);
							}
						} else {
							// console.log([tUser.cc.Profile.followerCount, MinFollowerCount, tUser.cc.Profile.CoinPriceBitCloutNanos, MinCoinPriceNanos])
						}
					}
				}
			}
			// console.log(newGigs);
			theGigs = newGigs;
		

			doSort(outSort);
			

		}

	}

	
	export const searchChange = async function() {
		let randomness = moment().unix();
		let searchFor = document.getElementById("searchInput").value;
		// console.dir(searchFor);
		if (searchFor) {
			searchState = searchFor;
			let rez = minisearch.search(searchFor, {
				fuzzy: true
			});
			let tOut = [];

			for (var tt of rez) {
				delete tt.randomness;
				let tz = {
					...tt,
					randomness
				}
				tOut.push(tz);
			}
			theGigs = tOut;

			await doSort(selectedSort);
			doGigs = runGigs();

		} else {
			searchReset();
		}
		// console.log(rez);
	};

	

	export const searchReset = async function() {
		theGigs = [...gigJSON];
		mainSearch = '';
		searchState = '';
		selectedSort = 'default';
		doGigs = runGigs();
	}

	
	let sortChange = async function(e) {
		// console.dir(e);
		let tVal = e.target.value;
		await doSort(tVal);
		
	}

	let init = async function() {
		try {
			console.log("starting");
			await getGigs();

			let theValue = "None";
			if (tUser !== null) {
				const uParams = new URLSearchParams(window.location.search);

				let hasId = uParams.get("id");
				// console.dir(hasId);
				if (!!hasId) {
					// none
				} else {
					selectedFilter = "For Me";
					theValue = "For Me";
				}
			}
			await doFilter({target: {value: theValue}});
		} catch (ex) {
			console.error(ex);
		} finally {
			isStarted = true;
		}

	};



	onMount(() => {
		init().then(() => {}).catch(e => console.error(e));
	});





	export let promoLinkDisabled = false;
	export let promoVerifyError = '';

	



	export let detailItem = {};
	export let detailOpen = false;
	export const detailToggle = (theItem = null) => {


		detailOpen = !detailOpen 

		if (theItem !== null) {
			detailItem = theItem;
			// window.history.replaceState({}, document.title, `${window.location.pathname}/?id=${theItem.Id}`)
			window.history.pushState({}, "CloutCast -- View Promotion", "/?id=" + theItem.Id);
		}

		if (!!!detailOpen) {	
			detailItem = {};
			promoVerifyError = '';
			window.history.pushState({}, "CloutCast - Spread your word", window.location.href.split("?id=")[0]);
			toggleDetail.set(0);
		}

	};
	
	toggleDetail.subscribe(tD => {
		if (tD !== 0) {
			for (var gig of theGigs) {
				if (gig.Id == tD) {
					detailToggle(gig);
					break;
				}
			}
		}
	})

  export const copyLink = async function(id) {
		
    await navigator.clipboard.writeText(window.location.origin + "/?id=" + id);	
		alert("Link copied to clipboard!")
  }

	export const goToLink = async function(detailItem) {
		console.dir(detailItem.gigPostHash);
		window.open(`https://bitclout.com/posts/${detailItem.gigPostHash}`, "_blank");
	}

	export const runPromoValidation = async function() {
		try {
		promoLinkDisabled = true;
		promoVerifyError = '';
		let validateWorkFetch = await fetch(`/api/promotion/provework/${detailItem.Id}.json`, {headers: {
			authorization: `Bearer ${tUser.cc.jwt}`
		}});
		let theText = await validateWorkFetch.text();
		if (theText == "OK") {
			detailOpen = false;
			await goto("/my/wallet");
			// window.location.href = `${window.location.origin}/my/wallet`;
		} else {
			promoVerifyError = theText;
		}
		} catch (ex) {
			console.error(ex);
			promoVerifyError = ex.message || "Unknown Error";
		} finally {
			promoLinkDisabled = false;
		}
    
	};

	

</script>


<svelte:head>
	<title>CloutCast - Spread your word</title>
</svelte:head>

<Jumbotron style="padding:1.5rem 1.5rem;">
	<h1 class="text-center">
		CloutCast.io
	</h1>
	<!-- <img src="logo.png" class="homeLogo" alt="cloutcast logo large"/> -->
	<h6 class="text-center">
		[[$Spread your word]]
	</h6>
</Jumbotron>
<div class="container-fluid">
	<Row>
		<!-- <Col sm="2">
			<h5 class="text-muted">
				Sort
			</h5>
			<div class="sortText">
				<Toggle type="radio" bind:group={selectedSort} value="default" let:checked={checked} onClick={sortChange}>
					{#if checked}
						<Icon name="check2" />
					{:else}
						<Icon name="x-circle" />
					{/if}
						Default Sort
				</Toggle>
				<Toggle type="radio" bind:group={selectedSort} value="highest" let:checked={checked} onClick={sortChange}>
					{#if checked}
						<Icon name="check2" />
					{:else}
						<Icon name="x-circle" />
					{/if}
						Highest Payout
				</Toggle>
				<Toggle type="radio" bind:group={selectedSort} value="lowest" let:checked={checked} onClick={sortChange}>
					{#if checked}
						<Icon name="check2" />
					{:else}
						<Icon name="x-circle" />
					{/if}
						Lowest Payout
				</Toggle>
			</div>
			<hr />
			<h5 class="text-muted">
				Filters
			</h5>
			<div>
				{#if typeof tUser.sub !== 'undefined'}
					<CustomInput
						type="switch"
						id="filterForMe"
						label="For Me" />
					<CustomInput
						type="switch"
						id="filterHODLRS"
						label="HODLRS" />
				{:else}
					Please sign in to see filters.
				{/if}
			</div>
			
		</Col> -->
		<Col>
			<!-- <InputGroup size="sm" class="mb-2">
				<Input bind:value={mainSearch} id="searchInput" type="text" placeholder="Search for a bitclout user, or promotion text..." />
				<InputGroupAddon addonType="append">
					<Button color="info" on:click={searchChange}>Search</Button>
					<Button color="secondary" on:click={searchReset}>Sort/Filters</Button>
					<Button color="danger" on:click={searchReset}>Reset</Button>
				</InputGroupAddon>
			</InputGroup> -->
			{#await awaitAuth then isAuthed}
			<Row class="mb-1">
				<Col class="mb-2">
					<Dropdown class="w-100">
						<DropdownToggle caret class="w-100">Sort - {selectedSort}</DropdownToggle>
						<DropdownMenu>
							<DropdownItem on:click={doSort} value="default">
								Newest
							</DropdownItem>
							<DropdownItem on:click={doSort} value="highest">
								Highest Payout
							</DropdownItem>
							<DropdownItem on:click={doSort} value="lowest">
								Lowest Payout
							</DropdownItem>
						</DropdownMenu> 
					</Dropdown>
				</Col>
				
				<Col class="mb-2">
					<Dropdown class="w-100">
						<DropdownToggle caret class="w-100">Filter - {selectedFilter}</DropdownToggle>
						<DropdownMenu>
							<DropdownItem on:click={doFilter} value="None">
								None
							</DropdownItem>
							<DropdownItem on:click={doFilter} value="For Me">
								For Me
							</DropdownItem>
						</DropdownMenu> 
					</Dropdown>
				</Col>

			</Row>
			<!-- <h6 class="text-muted">Sort</h6>
			<ButtonGroup class="w-100">
				<Button active={(selectedSort == 'default')} on:click={doSort} value="default">
					Default (Newest)
				</Button>
				<Button active={(selectedSort == 'highest')} on:click={doSort} value="highest">
					Highest Payout
				</Button>
				<Button active={(selectedSort == 'lowest')} on:click={doSort} value="lowest">
					Lowest Payout
				</Button>
			</ButtonGroup>
			<hr />
			
				{#if isAuthed == true}
					<h6 class="text-muted">Filter</h6>
					<ButtonGroup class="w-100">
						<Button active={(onlyMyPromos == false)} on:click={doFilter} value="all">
							No Filter
						</Button>
						<Button active={(onlyMyPromos == true)} on:click={doFilter} value="my">
							For Me
						</Button>
					</ButtonGroup>
					<hr />
				{/if} -->
			{/await}
			{#if searchState !== ''}
				<h4>Searching for {searchState} ({theGigs.length} found)</h4>
				<hr />
			{/if}
			{#await doGigs}
				<LoadingBlinker />
			{:then tGigs}
				{#each tGigs as tItem}
					<FeedRow {tItem} {detailToggle} />
				{/each}
			
			{:catch error}
				<Alert color="danger">{error}</Alert>
			{/await}
		</Col>
	</Row>
</div>

<Modal isOpen={detailOpen} toggle={detailToggle} size='xl'>
	<ModalHeader>
		Promotion Details
	</ModalHeader>
	<ModalBody>
		<FeedRow tItem={detailItem} detail {promoVerifyError} {runPromoValidation} {promoLinkDisabled} tUser={() =>{return tUser}} /> 
	</ModalBody>
	<ModalFooter>
		<Button color='danger' on:click={detailToggle}>Close</Button>
	</ModalFooter>
</Modal>