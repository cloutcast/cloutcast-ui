<script context="module">
	export async function preload({ params }) {
		try {
			let readmeFetch = await this.fetch('/README.get.md');
			let readmeText = await readmeFetch.text();

			return {
				readmeText
			}
		} catch(ex) {
			console.error(ex);
		}
	}
</script>

<svelte:head>
	<title>CloutCast - README.md</title>
</svelte:head>

<script>
	import {
Container,
		Jumbotron, Row, Col
	} from 'sveltestrap/src';
	import SvelteMarkdown from 'svelte-markdown';
	import * as marked from 'marked';


	export let readmeText;

	export let getReadme = async function() {
		try {
			let tOut = marked(readmeText);
			return tOut;
		} catch(ex) {
			return "ERROR GETTING README!"
		}
	}

	let gRead = getReadme();

	export const mdOptions = {
		gfm: true
	}
</script>

<!-- <Jumbotron>
	<h1 class="text-center">
		README.md [cloutcast.io/ui]
	</h1>
	<h6 class="text-center text-muted">
		[[$pread your word]] <br />
		V0.0.1 <br />
		Written by the <a href="https://bitclout.com/u/CloutCast" target="_blank">@CloutCast</a> team
	</h6>
</Jumbotron> -->
<Container>
	<Row>
		<Col>
			{#await gRead}
				Loading...
			{:then htmlReadme}
				<div class="readmeText">
					{@html htmlReadme}
				</div>
			{/await}
		</Col>
	</Row>
</Container>

