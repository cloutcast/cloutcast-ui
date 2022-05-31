<script context="module">
  export async function preload(page, session) {
    const { GOOGLE_ANALYTICS_KEY } = session;


    return {
      ga_id: GOOGLE_ANALYTICS_KEY
    }
  }
</script>


<script>
import { onMount } from 'svelte';
import {goto} from "@sapper/app";
	import Nav from '../components/Nav.svelte';

	import {
		cloutXRate, toggleCreate, bitCloutAuthUser, loginDone, userStore, toggleTheme
	} from "./../commonStore.js";
	import authService from '../auth/service.js';

	import jwt_decode from 'jwt-decode';

	import {
		Icon, Button,
		Modal, ModalBody, ModalHeader, ModalFooter, Jumbotron, Alert, Container
	} from 'sveltestrap/src';
	import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faPlus
	} from '@fortawesome/free-solid-svg-icons';

	import CreatePromotion from '../components/CreatePromotion.svelte';
	export let createPromoOpen = false;
	export const createPromoToggle = () => (createPromoOpen = !createPromoOpen);
	toggleCreate.subscribe((v) => { 
		console.log(v);
		if (v == "/" || v == "/my/promotions") {
			toggleCreate.set(false);
			createPromoOpen = false;
			if (v == "/") {
				window.location.href = window.location.origin;
			} else {
				window.location.href = `${window.location.origin}/my/promotions`;
			}
		}
	});

	export let segment;


	// console.log(ga_id);

	let ttToken;






	let isAuthLoaded = false;
	// authLoaded.subscribe(isL => isAuthLoaded = isL);
	loginDone.subscribe(isL => isAuthLoaded = isL);

	export let theme = "light";


	onMount(async() => {
		
		try {
			let xRateData = await fetch("/bitclout/xrate.json", {
				headers: {
					"cache-control" : "cache"
				}
			});
			let xRateJSON = await xRateData.json();
			console.log(xRateJSON);
			cloutXRate.set(xRateJSON);
			theme = localStorage.getItem("theme") || "light" ;
			toggleTheme.set(theme);
		} catch (ex) {
			console.error(ex);
		}
	});

	export const fabClick = async function () {
		createPromoOpen = true;
	};

	export const waitForAuth = function() {
		return new Promise((resolve, reject) => {
			let loadedAuthInt = setInterval(() => {
				if (isAuthLoaded) {
					clearInterval(loadedAuthInt);
					resolve();
				}
			}, 500);
		});
	}

	let authPromise = waitForAuth();

	import LoadingBlinker from '../components/LoadingBlinker.svelte';
	import BitCloutIdentity from '../components/Auth.svelte';;
	import NewRelic from '../components/NewRelic.svelte';
import SideNav from '../components/SideNav.svelte';
import MobileSidenav from '../components/MobileSidenav.svelte';
import InboxComponent from '../components/InboxComponent.svelte';


toggleTheme.subscribe(t => {
	if (t == true) {
		if (theme == 'light') {
			theme = 'dark'
		} else if (theme == 'dark') {
			theme = 'party';
		} else {
			theme = 'light';
		}
		localStorage.setItem("theme", theme);
		toggleTheme.set(theme);
	}
})
</script>
<svelte:head>
	{#if theme == 'party'} 
	<link rel="stylesheet" href="bs5.party.css">
	{:else if theme == 'dark'}
	<link rel="stylesheet" href="bs5.dark.css">
	{:else}
		<link rel="stylesheet" href="bs5.litera.css">
	{/if}
</svelte:head>
<style>
	.mainClass {
		display: flex;
    flex-wrap: nowrap;
    height: 100vh;
    height: -webkit-fill-available;
    max-height: 100vh;
    /* overflow-x: auto; */
    /* overflow-y: hidden; */
	}

	.mainBox {
		
		margin-left: 150px;
		width: 100%
	}
	@media screen and (max-width: 575px) {
		.mainBox {
			margin-left: 0;
			width: 100%;
		}
	}
</style>
<NewRelic />
<BitCloutIdentity />

<Modal size="lg" isOpen={createPromoOpen} toggle={() =>{}}>
	<ModalHeader toggle={createPromoToggle}>
		Create a Promotion
	</ModalHeader>
	<ModalBody>
		<CreatePromotion theUser={$userStore} />
	</ModalBody>
</Modal>
{#await authPromise}
	<LoadingBlinker jumbotron />
{:then}
{#if $userStore !== null}
<InboxComponent bUser={$userStore} />
{/if}
<MobileSidenav {fabClick} />

	<main class="mainClass">
		<SideNav {segment} {fabClick} tToken={ttToken} />
		<!-- <Alert color="dark">
			<Container>
				<h4 class="alert-heading">
					We're out of beta!
				</h4>
				CloutCast is now open to the public. ALL BitClout users are now welcome to use CloutCast! :D<br />
				<Button size="sm" color="light" outline href="https://www.notion.so/CloutCast-Read-Me-5dd54d062e9543b5a55316dc83627aa6" target="_blank">Click Here</Button> to see the white paper. <br />
				<Button size="sm" color="light" outline href="https://discord.gg/7mVz7TWKsM" target="_blank">Click Here</Button> to join our community/support discord! <br />
				
			</Container>
		</Alert> -->
		<div class="d-flex flex-grow-1 flex-column mainBox">
				<slot></slot>
				<footer class="py-3 my-3 border-top text-center" style="padding-bottom:60px !important;">
					&copy; 2021 @CloutCast <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms and Conditions</a> | Version 2.0.2.154
				</footer>
		</div>
	</main>
	<Nav {segment} {fabClick}  />		
{/await}
