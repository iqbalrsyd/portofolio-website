<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Tooltip, TooltipTrigger } from '$lib/components/ui/tooltip';
	import TooltipContent from '$lib/components/ui/tooltip/tooltip-content.svelte';
	import H4 from '$lib/components/ui/typography/h4.svelte';
	import Large from '$lib/components/ui/typography/large.svelte';
	import BaseData from '$lib/data/base';
	import NavBarData from '$lib/data/nav-bar';
	import { mode, toggleMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let isDarkMode = $derived($mode === 'dark');
	let activeSection = $state('');
	let isHomePage = $derived($page.url.pathname === '/');

	// Track which section is currently visible
	onMount(() => {
		const sectionIds = NavBarData.items.map((item) => item.href.slice(1));

		const observerOptions: IntersectionObserverInit = {
			rootMargin: '-60px 0px -80% 0px',
			threshold: 0
		};

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					activeSection = entry.target.id;
				}
			}
		}, observerOptions);

		// Observe all sections - use requestAnimationFrame to ensure DOM is ready
		requestAnimationFrame(() => {
			for (const sectionId of sectionIds) {
				const element = document.getElementById(sectionId);
				if (element) {
					observer.observe(element);
				}
			}
		});

		return () => {
			observer.disconnect();
		};
	});

	// Check if a section is currently active
	function isActive(href: string): boolean {
		if (!href.startsWith('#')) return false;
		const sectionId = href.slice(1);
		return activeSection === sectionId;
	}

	// Navigate to home or scroll to top depending on current page
	function goToHomeOrTop(e: MouseEvent): void {
		e.preventDefault();

		if (isHomePage) {
			// On home page, scroll to top
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		} else {
			// On other pages, navigate to home
			window.location.href = '/';
		}
	}

	// Scroll to a specific section or navigate to landing page
	function scrollToSection(e: MouseEvent, href: string): void {
		e.preventDefault();

		if (!href.startsWith('#')) {
			// If it's not a hash link, navigate to the URL
			window.location.href = href;
			return;
		}

		// Check if we're on the landing page
		if (!isHomePage) {
			// Navigate to landing page with hash
			window.location.href = `/${href}`;
			return;
		}

		// We're on the landing page, scroll to section
		const targetId = href.slice(1);
		const element = document.getElementById(targetId);

		if (!element) {
			console.error(`Section with id "${targetId}" not found`);
			// Fallback to hash navigation
			window.location.hash = targetId;
			return;
		}

		// Use native scrollIntoView for smooth scrolling
		element.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}
</script>

<div
	class="border-1 flex h-[50px] flex-row items-center border-b bg-[--bg] px-4 backdrop-blur-xl sm:px-8"
	style="--bg : hsl(var(--background) / 0.5)"
>
	<!-- Logo Button -->
	<div class="sm:flex-1">
		<a
			href="/"
			onclick={goToHomeOrTop}
			class="flex flex-row items-center justify-start gap-2 text-2xl hover:bg-accent rounded-md px-2 py-1 transition-colors"
			aria-label="Go to home"
		>
			<Tooltip>
				<TooltipTrigger>
					<Icon icon={NavBarData.left.icon} />
				</TooltipTrigger>
				<TooltipContent side="bottom" class="lg:hidden">
					{NavBarData.left.title}
				</TooltipContent>
			</Tooltip>
			<H4 className="hidden lg:block">{NavBarData.left.title}</H4>
		</a>
	</div>

	<!-- Desktop Navigation -->
	<div class="hidden flex-[2] flex-row items-center justify-center gap-2 sm:flex">
		{#each NavBarData.items as item}
			<a
				href={item.href}
				onclick={(e) => scrollToSection(e, item.href)}
				class="flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors {isActive(item.href)
					? 'bg-accent'
					: ''}"
				aria-label="Navigate to {item.title}"
				aria-current={isActive(item.href) ? 'true' : undefined}
			>
				<Icon icon={item.icon} className="text-xl" />
				<div class="hidden lg:block">{item.title}</div>
			</a>
		{/each}
	</div>

	<!-- Desktop Right Side Actions -->
	<div class="hidden flex-row items-center justify-end gap-2 sm:flex sm:flex-1">
		<a href="/search" aria-label="Search">
			<Button variant="ghost" class="text-xl">
				<Icon icon="i-carbon-search" />
			</Button>
		</a>
		<Button
			variant="ghost"
			class="text-xl"
			onclick={toggleMode}
			aria-label="Toggle {isDarkMode ? 'light' : 'dark'} mode"
		>
			<Icon icon={isDarkMode ? 'i-carbon-moon' : 'i-carbon-sun'} />
		</Button>
	</div>

	<!-- Mobile Name Display -->
	<div class="flex flex-[2] flex-row items-center justify-center sm:hidden">
		<a
			href="/"
			onclick={goToHomeOrTop}
			class="hover:bg-accent rounded-md px-2 py-1 transition-colors"
			aria-label="Go to home"
		>
			<Large>{BaseData.fullName}</Large>
		</a>
	</div>

	<!-- Mobile Menu Button -->
	<div class="flex flex-row items-center justify-center sm:hidden">
		<Dialog>
			<DialogTrigger asChild>
				<Button size="icon" variant="ghost" aria-label="Open menu">
					<Icon className="text-xl" icon="i-carbon-menu" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<div class="flex flex-col gap-2 pt-4">
					{#each NavBarData.items as item}
						{@const isSection = item.href.startsWith('#')}
						{#if isSection}
							<DialogClose asChild>
								<a
									href={item.href}
									onclick={(e) => scrollToSection(e, item.href)}
									class="flex w-full flex-row items-center justify-start gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors {isActive(
										item.href
									) ? 'bg-accent' : ''}"
									aria-label="Navigate to {item.title}"
								>
									<Icon icon={item.icon} className="text-xl" />
									<div>{item.title}</div>
								</a>
							</DialogClose>
						{:else}
							<a href={item.href} class="w-full" aria-label="{item.title}">
								<Button
									class="flex w-full flex-row items-center justify-start gap-2"
									variant="ghost"
								>
									<Icon icon={item.icon} className="text-xl" />
									<div>{item.title}</div>
								</Button>
							</a>
						{/if}
					{/each}
					<Separator />
					<DialogClose asChild>
						<a href="/search" class="w-full" aria-label="Search">
							<Button
								class="flex w-full flex-row items-center justify-start gap-2"
								variant="ghost"
							>
								<Icon icon={'i-carbon-search'} className="text-xl" />
								<div>Search</div>
							</Button>
						</a>
					</DialogClose>
					<Separator />
					<DialogClose asChild>
						<Button
							class="flex w-full flex-row items-center justify-start gap-2"
							variant="ghost"
							onclick={toggleMode}
							aria-label="Toggle {isDarkMode ? 'light' : 'dark'} mode"
						>
							<Icon icon={isDarkMode ? 'i-carbon-moon' : 'i-carbon-sun'} className="text-xl" />
							<div>{isDarkMode ? 'Dark' : 'Light'}</div>
						</Button>
					</DialogClose>
				</div>
				<DialogFooter class="items-end">
					<DialogClose asChild>
						<Button>Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
</div>
