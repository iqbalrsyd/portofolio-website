<script lang="ts">
	import NavBar from '$lib/components/common/nav-bar/nav-bar.svelte';
	import { onMount } from 'svelte';
	import 'virtual:uno.css';
	import '../app.css';
	import '../markdown.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();

	let isVisible = $state(true); // Variabel untuk menentukan visibilitas navbar
	let lastScrollY = $state(0);

	const handleScroll = () => {
		const currentScrollY = window.scrollY;
		isVisible = currentScrollY < lastScrollY || currentScrollY === 0;
		lastScrollY = currentScrollY;
	};

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<ModeWatcher />
<div class="flex h-screen w-screen flex-col overflow-x-hidden">
	<div
		class="fixed top-0 left-0 right-0 z-50 bg-background transition-transform duration-300"
		class:navbar-hidden={!isVisible}
	>
		<NavBar />
	</div>
	<div class="mt-[50px] flex flex-1 flex-col">{@render children()}</div>
</div>

<style>
	.navbar-hidden {
		transform: translateY(-100%);
	}
</style>
